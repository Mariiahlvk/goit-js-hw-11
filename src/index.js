// import './sass/index.scss';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const form = document.querySelector('.search-form');
const input = document.querySelector('input');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector('.load-more');
const MYAPI_KEY = '30717233-38e08d718f07f6530bf8a65f5';
const myUrl = 'https://pixabay.com/api/';

let page = 1;
let perPage = 40;

form.addEventListener('submit', onSubmit);
loadBtn.addEventListener('click', onLoad);

const getUrlApi = (MYAPI_KEY, inputValue, page, perPage) =>
  `?key=${MYAPI_KEY}&q=${inputValue}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;

async function onSubmit(event) {
  event.preventDefault();
  const inputValue = input.value.trim();

  if (inputValue) {
    gallery.innerHTML = '';
    page = 1;

    try {
      axios.defaults.baseURL = myUrl;
      const response = await axios.get(
        getUrlApi(MYAPI_KEY, inputValue, page, perPage)
      );
      if (response.data.hits.length === 0) {
        Notiflix.Report.warning('No images for your search');
      }

      if (response.data.hits.length > 0) {
        loadBtn.classList.remove('is-hidden');
        render(response.data.hits);
        const simpleLightbox = new SimpleLightbox('.gallery a', {
          captionDelay: 250,
          captionsData: 'alt',
        }).refresh();
        const totalHits = response.data.totalHits;
        Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
      }
      if (response.data.hits.length < 40) {
        loadBtn.classList.add('is-hidden');
      }
    } catch (error) {
      console.log(error);
    }
  }
}

function render(image) {
  const newGallery = image
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="main">
      <a class="photo-link" href="${largeImageURL}">
        <img class="image" src="${webformatURL}" alt="${tags}" loading="lazy"  width="300" height="300"/>
      </a>
   <div class="info">
    <p class="info-item"> 
      <b> Likes:
       ${likes}</b>
    </p>
    <p class="info-item">
      <b> Views: ${views}</b>
    </p>
    <p class="info-item">
      <b> Comments: ${comments}</b>
    </p>
    <p class="info-item">
      <b> Downloads: ${downloads}</b>
    </p>
   </div>
 </div>`;
      }
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', newGallery);
}

async function onLoad(event) {
  event.preventDefault();
  const inputValue = input.value.trim();
  page += 1;
  try {
    axios.defaults.baseURL = myUrl;
    const response = await axios.get(
      getUrlApi(MYAPI_KEY, inputValue, page, perPage)
    );
    render(response.data.hits);
    const simpleLightbox = new SimpleLightbox('.gallery a').refresh();
    const maxValue = Math.floor(response.data.totalHits / perPage);
    if (maxValue < page) {
      loadBtn.classList.add('is-hidden');
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (error) {
    console.log(error);
  }
}
