console.warn('it works!')

const state = {
  allCountriesList: [],
  activeCountryId: null,
  addedCities: [],
};

const buildVkRequestUrl = (type, inputValue) => {
  const accessToken = '8b4cc71d8b4cc71d8b4cc71d0a8b3e304d88b4c8b4cc71dd44a30a94cb3c00c7e533a90';
  const apiVersion = '5.120';
  const language = '0'; // ru

  const methodsMapper = {
    countries: 'database.getCountries',
    cities: 'database.getCities',
  };
  const parametersMapper = {
    countries: 'need_all=1&count=300',
    cities: `country_id=${state.activeCountryId || 1}&q=${inputValue}`
  };

  const methodName = methodsMapper[type];
  const parameters = parametersMapper[type];

  return `https://api.vk.com/method/${methodName}?${parameters}&lang=${language}&access_token=${accessToken}&v=${apiVersion}`;
};

const updateStateCountriesList = () => {
  const url = buildVkRequestUrl('countries');
    $.ajax({
      url,
      type: 'GET',
      crossDomain: true,
      dataType: 'jsonp',
    })
      .done(({ response }) => state.allCountriesList = response.items)
      .fail((error) => console.error(error));
};

const cityInput = document.querySelector('.city-input');
const cityForm = document.querySelector('.city-form');
const citiesList = document.querySelector('.cities-list');

ymaps.ready(() => {
  const map = new ymaps.Map("map", {
    center: [30, 20],
    zoom: 2,
    controls: [],
  });

  updateStateCountriesList();

  const getLi = (text) => {
    const span = document.createElement('span');
    span.textContent = text;

    const closeButton = document.createElement('button');
    closeButton.textContent = 'x';
    closeButton.classList.add('btn', 'btn-danger', 'mx-3', 'my-1');
    closeButton.addEventListener('click', handleRemove(text))

    const li = document.createElement('li');
    li.append(span);
    li.append(closeButton);
    return li;
  };

  const renderCitiesList = (cities) => {
    citiesList.innerHTML = '';
    const listItems = cities.map(getLi);
    listItems.forEach((li) => citiesList.append(li));
  };

  const handleRemove = (city) => (e) => {
    ymaps.geocode(city).then((res) => {
      console.log('handleClick -> res', res);
      console.log('handleClick -> map', map);
      map.geoObjects.remove(res.geoObjects.get(0));
      console.log('handleClick -> map.geoObjects', map.geoObjects);
    });
  }

  $(".country-input").autocomplete({
    source: (request, response) => {
      const countries = state.allCountriesList.map(({ title }) => title);
      const matchedCountries = countries.filter((country) => country.toLowerCase().startsWith(request.term.toLowerCase()));
      response(matchedCountries);
    },
    minLength: 2,
    select: (_event, ui) => {
      const { id } = state.allCountriesList.find(({ title }) => title === ui.item.label);
      state.activeCountryId = id;
      cityInput.removeAttribute('disabled');
    }
  });

  $(".city-input").autocomplete({
    source: (request, response) => {
      $.ajax({
        url: buildVkRequestUrl('cities', request.term),
        type: 'GET',
        crossDomain: true,
        dataType: "jsonp",
        success: (data) => {
          const cities = data.response.items.map(({ title }) => (title));
          response(cities);
        }
      });
    },
    minLength: 2,
  });

  const submitHandle = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const country = formData.get('country');
    const city = formData.get('city');
    state.addedCities.push(city);
    renderCitiesList(state.addedCities);
    ymaps.geocode(`${country} ${city}`).then((res) => {
      map.geoObjects.add(res.geoObjects.get(0));
    console.log('submitHandle -> res', res);
    });
  };

  // cityInput.addEventListener('input', inputHandle);
  cityForm.addEventListener('submit', submitHandle);
});
