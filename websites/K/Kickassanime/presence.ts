const presence = new Presence({
    clientId: "802964241179082822"
  }),
  strings = presence.getStrings({
    play: "presence.playback.playing",
    pause: "presence.playback.paused"
  }),
  nextEpisodeElement = document.querySelector(
    "div#sidebar-anime-info > div.border.rounded.mb-3.p-3:nth-child(2) > div:nth-child(1) > a.ka-url-wrapper"
  ),
  previousEpisodeElement = document.querySelector(
    "div#sidebar-anime-info > div.border.rounded.mb-3.p-3:nth-child(2) > div:nth-child(2) > a.ka-url-wrapper"
  );

let browsingStamp = Math.floor(Date.now() / 1000),
  video = {
    duration: 0,
    currentTime: 0,
    paused: true
  },
  currentTime: number,
  duration: number,
  paused = true,
  lastPlaybackState: boolean = null,
  playback: boolean,
  currentAnimeWatching: Array<string>,
  currentAnimeTitle: string,
  currentAnimeEpisode: string,
  isMovie: boolean = null;

function checkIfMovie() {
  nextEpisodeElement == null && previousEpisodeElement == null
    ? (isMovie = true)
    : nextEpisodeElement !== null && previousEpisodeElement == null
    ? (isMovie = false)
    : nextEpisodeElement == null && previousEpisodeElement !== null
    ? (isMovie = false)
    : nextEpisodeElement !== null && previousEpisodeElement !== null
    ? (isMovie = false)
    : (isMovie = true);
}

presence.on(
  "iFrameData",
  (data: { duration: number; currentTime: number; paused: boolean }) => {
    video = data;
    playback = video.duration !== null ? true : false;

    if (playback) {
      currentTime = video.currentTime;
      duration = video.duration;
      paused = video.paused;
    }

    if (lastPlaybackState != playback) {
      lastPlaybackState = playback;
      browsingStamp = Math.floor(Date.now() / 1000);
    }
  }
);

presence.on("UpdateData", async () => {
  const timestamps = presence.getTimestamps(
      Math.floor(currentTime),
      Math.floor(duration)
    ),
    presenceData: PresenceData = {
      largeImageKey: "kaa"
    };

  presenceData.startTimestamp = browsingStamp;

  if (
    document.location.pathname.includes("/anime/") &&
    document.location.pathname.includes("/episode")
  ) {
    checkIfMovie();
    if (playback == true && !isNaN(duration)) {
      presenceData.smallImageKey = paused ? "pause" : "play";
      presenceData.smallImageText = paused
        ? (await strings).pause
        : (await strings).play;
      presenceData.startTimestamp = timestamps[0];
      presenceData.endTimestamp = timestamps[1];
      (currentAnimeWatching = document
        .querySelector("h1.title")
        .textContent.split("-")),
        (currentAnimeEpisode =
          isMovie == true
            ? "Movie"
            : currentAnimeWatching[1].substring(
                1,
                currentAnimeWatching[1].length
              ));

      presenceData.details = `${currentAnimeTitle}`;
      presenceData.state = `${currentAnimeEpisode}`;

      if (paused) {
        delete presenceData.startTimestamp;
        delete presenceData.endTimestamp;
      }
    } else {
      (currentAnimeWatching = document
        .querySelector("h1.title")
        .textContent.split("-")),
        (currentAnimeTitle = currentAnimeWatching[0].substring(
          0,
          currentAnimeWatching[0].length - 1
        )),
        (currentAnimeEpisode =
          isMovie == true
            ? "Movie"
            : currentAnimeWatching[1].substring(
                1,
                currentAnimeWatching[1].length
              ));

      presenceData.details = `${currentAnimeTitle}`;
      presenceData.state = `${currentAnimeEpisode}`;

      if (paused) {
        delete presenceData.startTimestamp;
        delete presenceData.endTimestamp;
      }
    }
  } else if (
    document.location.pathname.includes("/anime/") &&
    document.location.pathname.includes("/episode") == false
  ) {
    currentAnimeTitle = document.querySelector("h1.title").textContent;
    presenceData.details = "Looking at:";
    presenceData.state = `${currentAnimeTitle}`;
    presenceData.smallImageKey = "searching";
  } else if (document.location.pathname.includes("anime-list")) {
    presenceData.details = "Looking at:";
    presenceData.state = "Anime List";
    presenceData.smallImageKey = "searching";
  } else if (document.location.pathname.includes("new-season")) {
    presenceData.details = "Looking at:";
    presenceData.state = "New Season";
    presenceData.smallImageKey = "searching";
  } else if (document.location.pathname.includes("favorites")) {
    presenceData.details = "Looking at:";
    presenceData.state = "Their Favorites";
    presenceData.smallImageKey = "searching";
  } else if (document.location.pathname.includes("watched")) {
    presenceData.details = "Looking at:";
    presenceData.state = "Watch History";
    presenceData.smallImageKey = "searching";
  } else if (document.location.pathname == "/") {
    presenceData.details = "Looking at:";
    presenceData.state = "Home Page";
    presenceData.smallImageKey = "searching";
  } else {
    presenceData.details = "Looking at:";
    presenceData.state = "An Unsupported Page";
  }

  presence.setActivity(presenceData);
});
