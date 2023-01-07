# PlaylistSearch
Live website URL: https://brothstudios.pythonanywhere.com

Sign in to your YouTube™ account to show your playlists, click the playlist and then search for any video in that playlist. 

Due to YouTube™'s API restrictions there is a 5000 video limit per playlist, so unfortunately any videos that are past the 5000 mark in the playlist will not show up in the search.

YouTube™ does not allow developers to access your "Watch Later" or "History" playlists, so this will not work on those playlists.

Uses Flask to create the webpage and routes, the search function and all YouTube™ API processes are done with JavaScript. Search results and playlists are displayed using Handlebars.


# How It Works
Using YouTube™'s Data API, once the user logs in it sends a call to the user's account and grabs all their playlist ID's and info. The playlist information is stored in a Javascript object, Handlebars is used to loop through the object and make a card on the homepage for each playlist, displaying the name, thumbnail, and a link to send to the /playlist route page. The link contains the playlist ID in the URL, so when you go to the /playlist page another API call is made using the playlist ID from the URL which grabs all the videos from the playlist and puts them in a Javascript object. 

The search feature filters through the object values (which contains the video titles) and creates an object of all the matches it finds. Handlebars is used to loop through this object and display cards for each result, once again displaying the name, thumbnail, and a link which opens the video in a new tab. With the way the YouTube™ API works, it does not get the correct channel name for the videos so it does not currently display that.
