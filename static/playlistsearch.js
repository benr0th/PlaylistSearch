let GoogleAuth
let results = {}
let filtered = {}
let videos = {}
let pl_list = {}
let urlParams;
const scope = 'https://www.googleapis.com/auth/youtube.readonly'
const discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'
function handleClientLoad() {
    // Load the API's client and auth2 modules.
    // Call the initClient function after the modules load.
    gapi.load('client:auth2', initClient)
}

function clear() {
    //Removes playlists from the front page
    pl_list = {};
    $('#page-inner').html(pl_list)
    $('#total').html('')
}

function handleAuthClick() {
    if (GoogleAuth.isSignedIn.get()) {
        // User is authorized and has clicked "Sign out" button.
        GoogleAuth.signOut().then(function() {
            clear()
        })
    } else {
        // User is not signed in. Start Google auth flow.
        GoogleAuth.signIn().then(function() {
            clear();
            frontPage()
        })
    }
}

function revokeAccess() {
    clear();
    GoogleAuth.disconnect()
}

function setSignInStatus(isSignedIn) {
    const user = GoogleAuth.currentUser.get();
    const isAuthorized = user.hasGrantedScopes(scope);
    if (isAuthorized) {
      $('#sign-in-or-out-button').html('Sign out');
      $('#revoke-access-button').css('display', 'inline-block');
      $('#auth-status').html('You are currently signed in and have granted ' +
          'access to this app.');
      $('#demo').css('display', 'none')
    } else {
      $('#sign-in-or-out-button').html('Sign In/Authorize');
      $('#revoke-access-button').css('display', 'none');
      $('#auth-status').html('You have not authorized this app or you are ' +
          'signed out.');
      $('#demo').css('display', 'inline')
    }
}

function updateSignInStatus(isSignedIn) {
    setSignInStatus();
}

//Get User's Playlists
function getPlaylists(next_page_token) {
    if (typeof gapi.client.youtube !== "undefined") {
        return gapi.client.youtube.playlists.list({
            "part": ["snippet"],
            "maxResults": 50,
            "mine": true,
            "pageToken": next_page_token
        }).then(function (response) {
            // Handle the results here (response.result has the parsed body).
            let result = response.result;
            let items = result["items"];
            //Adds Liked Playlist to the object
            pl_list['LL'] = ['Liked Videos', 'https://logos-world.net/wp-content/uploads/2020/04/YouTube-Emblem.png']
            //Loop through all playlists, add to object
            for (let i = 0; i < items.length; i++) {
                pl_list[items[i].id] = [[i].snippet.title, items[i].snippet.thumbnails.high.url]
            }
            //If there are more than 50, keep adding until none left
            if (typeof result['nextPageToken'] !== "undefined") {
                getPlaylists(result['nextPageToken'])
            }
            //Displays total number of Playlists
            let total = result["pageInfo"]["totalResults"]
            document.getElementById('total').innerHTML = total + " Playlists"
            console.log("Response", response)
        }, function (err) {
            console.error("Execute error", err)
        })
    }
    else {
        setTimeout(getPlaylists, 1000)
    }
}

//Demo Playlists
function demoPlaylists() {
    return gapi.client.youtube.playlists.list({
        "part": ["snippet"],
        "maxResults": 50,
        "channelId": "UC_x5XG1OV2P6uZZ5FSM9Ttw"
    }).then(function (response) {
        pl_list = {};
        // Handle the results here (response.result has the parsed body).
        let result = response.result;
        let items = result["items"];
        //Loop through all playlists, add to object
        for (let i = 0; i < items.length; i++) {
            pl_list[items[i].id] = [items[i].snippet.title, items[i].snippet.thumbnails.high.url]
        }
        console.log("Response", response)
    }, function (err) {
        console.error("Execute error", err)
    })
}

//Add videos from playlist to an object
function getVideos(playlistID, next_page_token) {
    //Gets the ID of the playlist from the url to pass to the function
    let playlist_url = window.location.pathname.split('/');
    playlistID = playlist_url[2];
    if (typeof gapi.client.youtube !== "undefined") {
        return gapi.client.youtube.playlistItems.list({
            "part": ["snippet,contentDetails"],
            "maxResults": 50,
            "playlistId": playlistID,
            "pageToken": next_page_token
        }).then(function(response) {
            // Handle the results here (response.result has the parsed body).
            let result = response.result;
            let items = result["items"];
            //Loop through all videos from playlist, add to object
            for (let i = 0; i < items.length; i++) {
                //If there is no thumbnail, give it a default YT logo picture instead
                if (typeof items[i].snippet.thumbnails == "undefined" || typeof items[i].snippet.thumbnails.high == "undefined") {
                    videos[items[i].snippet.resourceId.videoId] = [items[i].snippet.title, 'https://logos-world.net/wp-content/uploads/2020/04/YouTube-Emblem.png', items[i].contentDetails.duration]
                } else {
                    videos[items[i].snippet.resourceId.videoId] = [items[i].snippet.title, items[i].snippet.thumbnails.high.url, items[i].contentDetails.duration]
                }
            }
            //Keep getting videos until none left
            if (typeof result['nextPageToken'] !== "undefined") {
                getVideos(playlistID, result['nextPageToken'])
            }
            //Displays total number of videos
            let total = result["pageInfo"]["totalResults"]
            document.getElementById('total').innerHTML = total + " Videos"
            console.log("Response", response)
        }, function(err) {
            console.error("Execute error", err)
        })
    }
    else {
        setTimeout(getVideos, 1000)
    }
}

//Adds the playlists to the front page
function showPlaylist() {
    if (Object.keys(pl_list).length > 0) {
        let requestInfo = document.getElementById('requests-template').innerHTML;

        let template = Handlebars.compile(requestInfo);
        let requestData = template({
            requests: pl_list
        })
        $('#page-inner').html(requestData);
    }
    else {
        setTimeout(showPlaylist, 500)
    }
}

//Adds the videos to the page
function showVideos() {
    let requestInfo = document.getElementById('requests-template').innerHTML;

    let template = Handlebars.compile(requestInfo);
    let requestData = template({
        requests: videos
    })
    $('#page-inner').html(requestData);
}

//Gets user's playlists and displays them
function frontPage() {
    getPlaylists();
    showPlaylist();
}

//Searches the videos object and creates an object of the results
function searchVideo() {
    if (document.getElementById('searchField').value === '') {
        alert('Please enter a search term.')
    } else {
        let input = document.getElementById('searchField').value;
        results = Object.values(videos).filter(t => t[0].toUpperCase().includes(input.toUpperCase()));
        filtered = Object.keys(videos).reduce(function (r, e) {
            if (results.includes(videos[e])) r[e] = videos[e]
            return r;
        }, {});
        //Displays the search results
        let requestInfo = document.getElementById('requests-template').innerHTML;

        let template = Handlebars.compile(requestInfo);
        let requestData = template({
            requests: filtered
        })
        $('#page-inner').html(requestData);
    }
}

//Searches playlists object
function searchPlaylist() {
    if (document.getElementById('searchField').value === '') {
        alert('Please enter a search term.')
    } else {
        let input = document.getElementById('searchField').value;
        results = Object.values(pl_list).filter(t => t[0].toUpperCase().includes(input.toUpperCase()));
        filtered = Object.keys(pl_list).reduce(function (r, e) {
            if (results.includes(pl_list[e])) r[e] = pl_list[e]
            return r;
        }, {});
        //Displays the search results
        let requestInfo = document.getElementById('requests-template').innerHTML;

        let template = Handlebars.compile(requestInfo);
        let requestData = template({
            requests: filtered
        })
        $('#page-inner').html(requestData);
    }
}


