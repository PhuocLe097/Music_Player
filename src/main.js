const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = "MUSIC_PLAYER";

const title = $(".title");
const cd = $(".CD");
const imgSrc = $(".CD");
const audio = $("#audio");
const btnPlay = $("#btn-play");
const progress = $("#line");
const btnNext = $(".fa-step-forward");
const btnPrev = $(".fa-step-backward");
const btnRandom = $(".fa-random");
const btnRepeat = $(".fa-redo");
const playlist = $(".list");

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {}, //Khi lấy item đó ra (nếu có) thì cần phải giải mã Json bằng parse
  songs: [
    {
      name: "Nevada",
      singer: "Vicetone",
      path: "../assets/music/song1.mp3",
      image: "../assets/image/1.png",
    },
    {
      name: "Summer Time",
      singer: "K-391",
      path: "../assets/music/song2.mp3",
      image: "../assets/image/2.png",
    },
    {
      name: "All Fall Down",
      singer: "Allan Walker",
      path: "../assets/music/song3.mp3",
      image: "../assets/image/3.png",
    },
    {
      name: "Toxic",
      singer: "BoyWithUke",
      path: "../assets/music/song4.mp3",
      image: "../assets/image/4.png",
    },
    {
      name: "Legend never die",
      singer: "Akali",
      path: "../assets/music/song5.mp3",
      image: "../assets/image/5.png",
    },
    {
      name: "Thời không sai lệch",
      singer: "Vương Tứ Gia",
      path: "../assets/music/song6.mp3",
      image: "../assets/image/6.png",
    },
    {
      name: "Tháng tư là lời nói dối của em",
      singer: "Hà Anh Tuấn",
      path: "../assets/music/song1.mp3",
      image: "../assets/image/1.png",
    },
    {
      name: "Music 8",
      singer: "Singer 8",
      path: "../assets/music/song8.mp3",
      image: "../assets/image/7.png",
    },
    {
      name: "Music 9",
      singer: "Singer 9",
      path: "../assets/music/song9.mp3",
      image: "../assets/image/2.png",
    },
    {
      name: "Music 10",
      singer: "Singer 10",
      path: "../assets/music/song10.mp3",
      image: "../assets/image/3.png",
    },
  ],

  defineProperties: function () {
    //Khi gọi currentSong thì có thể lấy ra bài hát hiện tại
    Object.defineProperty(this, "currentSong", {
      get: function () {
        return this.songs[this.currentIndex];
      },
    });
  },

  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
        <li class="list-item ${
          index === app.currentIndex ? "active-song" : ""
        }" data-index="${index}">
          <img
            class="item-img"
            src='${song.image}'
            alt="hinh anh"
          />
          <div class="item-name">
            <p class="${
              index === app.currentIndex ? "active-song-text" : ""
            }">${song.name}</p>
            <span>${song.singer}</span>
          </div>
          <div>
            <i class="fas fa-ellipsis-h" style="color: white"></i>
          </div>
        </li>
      `;
    });

    $(".list").innerHTML = htmls.join("");
  },

  handleEvent: function () {
    _this = this;

    const spanCD = $(".CD-span");
    const spanWidth = spanCD.offsetWidth;
    const cdWidth = cd.offsetWidth;

    //Xử lý animation cho CD
    const cdAnimation = cd.animate([{ transform: "rotate(360deg)" }], {
      duration: 10000,
      interations: Infinity,
    });
    cdAnimation.pause();

    //Scroll để zoom in/out CD
    document.onscroll = () => {
      const srollTop = window.scrollY || document.documentElement.scrollTop;
      const newWidth = cdWidth - srollTop;
      const newSpanWidth = spanWidth - srollTop;

      cd.style.width = newWidth > 0 ? newWidth + "px" : 0;
      cd.style.height = newWidth > 0 ? newWidth + "px" : 0;

      spanCD.style.height = newSpanWidth > 0 ? newSpanWidth + "px" : 0;
      spanCD.style.width = newSpanWidth > 0 ? newSpanWidth + "px" : 0;
      spanCD.style.padding = newSpanWidth > 0 ? "10px" : 0;
      spanCD.style.display = newSpanWidth > 0 ? "block" : "none";

      cd.style.opacity = newWidth / cdWidth;
    };

    //Nút play/pause
    btnPlay.onclick = function () {
      app.isPlaying ? audio.pause() : audio.play();
    };

    //Lắng nghe khi song play
    audio.onplay = () => {
      app.isPlaying = true;
      btnPlay.classList.replace("fa-play", "fa-pause");
      btnPlay.classList.replace("icon-play", "icon-pause");
      cdAnimation.play();
    };

    //Lắng nghe khi song pause
    audio.onpause = () => {
      app.isPlaying = false;
      btnPlay.classList.replace("fa-pause", "fa-play");
      btnPlay.classList.replace("icon-pause", "icon-play");
      cdAnimation.pause();
    };

    //Khi tiến độ bài hát thay đổi
    audio.ontimeupdate = () => {
      if (audio.duration) {
        const percent = Math.floor((audio.currentTime / audio.duration) * 100);
        progress.value = percent;
      }
    };

    //Khi tua bài hát
    progress.oninput = (e) => {
      const seek = (audio.duration / 100) * e.target.value;
      audio.currentTime = seek;
    };

    //Khi nhấn next bài
    btnNext.onclick = () => {
      // nếu chọn random thì lấy list random còn ko thì như bth
      this.isRandom ? _this.randomSong() : app.nextSong();
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    //Khi nhấn prev bài
    btnPrev.onclick = () => {
      // nếu chọn random thì lấy list random còn ko thì như bth
      this.isRandom ? _this.randomSong() : app.prevSong();
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    };

    //Khi nhấn nút random
    btnRandom.onclick = (e) => {
      _this.isRandom = !_this.isRandom;
      //set config lưu tuỳ chọn phát ngẫu nhiên vào local để chuyển bài thì vẫn giữ nguyên ko bị mất
      _this.setConfig("isRandom", _this.isRandom);
      btnRandom.classList.toggle("active", _this.isRandom);
    };

    //Khi nhấn nút repeat
    btnRepeat.onclick = (e) => {
      _this.isRepeat = !_this.isRepeat;
      //set config lưu tuỳ chọn phát lặp lại vào local để chuyển bài thì vẫn giữ nguyên ko bị mất
      _this.setConfig("isRepeat", _this.isRepeat);
      btnRepeat.classList.toggle("active", _this.isRepeat);
    };

    //Khi bài hát kết thúc
    audio.onended = () => {
      // qua bài tiếp theo
      _this.isRepeat ? audio.play() : btnNext.onclick();
    };

    //Lắng nghe hành vi click vào pplaylist
    playlist.onclick = (e) => {
      let songActive = e.target.closest(".list-item:not(.active-song)");

      // closest dùng để tìm parent gần nhất của element được chọn theo cách tìm querySelector
      //trong dấu () là ('cha cần tìm')
      if (songActive || e.target.closest(".fa-ellipsis-h")) {
        //Xử lí khi click vào để active song
        if (songActive) {
          _this.currentIndex = Number(songActive.dataset.index);
          //index lúc đầu là dạng số nhưng khi dùng dataset trả về dạng string nên set cho CurrentIndex sai
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }
        //Xử lí khi click vào option của song
        if (e.target.closest(".fa-ellipsis-h")) {
        }
      }
    };
  },

  //Dùng để set 1 tuỳ chọn như phát ngẫu nhiên/ lặp lại vào trong localStorage
  setConfig: function (key, value) {
    this.config[key] = value; //config nhận vào 1 phần tử có key và value theo dạng key: value để lưu vào local 
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config)); //Khi set 1 item thì cần chuyển nó thành Json bằng stringify
  },

  loadConfig: function () {
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat;   
  },

  //Load bài hát hiện tại lên giao diện
  loadCurrentSong: function () {
    title.innerText = this.currentSong.name;
    imgSrc.setAttribute("src", this.currentSong.image);
    audio.setAttribute("src", this.currentSong.path);
  },

  // Qua bài tiếp theo
  nextSong: function () {
    this.currentIndex++;
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong();
  },

  //Trở lại bài trước
  prevSong: function () {
    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong();
  },

  //Phát bài random
  randomSong: function () {
    let newRandomSong;
    do {
      newRandomSong = Math.floor(Math.random() * this.songs.length);
    } while (newRandomSong == this.currentIndex);
    this.currentIndex = newRandomSong;
    this.loadCurrentSong();
  },

  //Khi phát nếu song nằm ngoài view thì kéo nó vào view lại
  scrollToActiveSong: function () {
    setTimeout(() => {
      $(".list-item.active-song").scrollIntoView({ //scrollIntoView là method dùng để kéo 1 phần tử bên ngoài vào DOM
        behavior: "smooth",
        block: "end",
      });
    }, 300);
  },

  start: function () {
    this.loadConfig(); //Gán cấu hình từ config vào ứng dụng
    this.defineProperties();
    this.handleEvent();
    this.loadCurrentSong();
    this.render();

    //Hiển thị trạng thái ban đầu của button random & repeat
    btnRepeat.classList.toggle("active", _this.isRepeat);
    btnRandom.classList.toggle("active", _this.isRandom);

  },
};

app.start();
