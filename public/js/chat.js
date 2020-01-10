const socket = io()
const $messageForm = document.querySelector('#message-form')
const $messageInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


//templates


//options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
// socket.on('countUpdated', (count) => {
//     console.log('The count has been updated!', count)
// })

const autoScroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild

    // Height of last messsage
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessagesMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessagesMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    // Height of message container 
    const containerHeight = $messages.scrollHeight

    // how far have i scrolled?
    const scrollOfsset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOfsset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('locationMessage', (url) => {
    const html = Mustache.render(locationTemplate, {
        username: url.username,
        url: url.url,
        createdAt: moment(URL.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message : message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')
    //disable
    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageInput.value = ''
        $messageInput.focus()
        // enable 
        if(error){
            return console.log(error)
        }
        console.log('Message delivered!')
    })
})

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Clicked')
//     socket.emit('increment')
    
// })

$locationButton.addEventListener('click', (e) => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.')
    }
    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {latitude: position.coords.latitude, longitude: position.coords.longitude}, () => {
            $locationButton.removeAttribute('disabled')
            console.log('Location shared!')
        } )
    })
})

socket.emit('join', { username, room }, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})