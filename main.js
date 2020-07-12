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

  const methodsMap = {
    countries: 'database.getCountries',
    cities: 'database.getCities',
  };
  const parametersMap = {
    countries: 'need_all=1&count=300',
    cities: `country_id=${state.activeCountryId || 1}&q=${inputValue}`
  };

  const methodName = methodsMap[type];
  const parameters = parametersMap[type];

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

const getLi = (text) => {
  const li = document.createElement('li');
  li.textContent = text;
  return li;
};

const renderCitiesList = (cities) => {
  citiesList.innerHTML = '';
  const listItems = cities.map(getLi);
  listItems.forEach((li) => citiesList.append(li));
};

ymaps.ready(() => {
  const map = new ymaps.Map("map", {
    center: [30, 20],
    zoom: 2,
    controls: [],
  });

  updateStateCountriesList();

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
    });
  };

  // cityInput.addEventListener('input', inputHandle);
  cityForm.addEventListener('submit', submitHandle);
});
