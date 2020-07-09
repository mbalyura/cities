console.warn('it works!')

const accessToken = '8b4cc71d8b4cc71d8b4cc71d0a8b3e304d88b4c8b4cc71dd44a30a94cb3c00c7e533a90';
const apiVersion = '5.120';

const getCityRequestUrl = (city) => {
  const methodName = 'database.getCities';
  const countryId = '1';
  const query = city;
  const parameters = `country_id=${countryId}&q=${query}` // последовательность пар name=value, разделенных амперсандом.
  return `https://api.vk.com/method/${methodName}?${parameters}&access_token=${accessToken}&v=${apiVersion}`;
};

const cityInput = document.querySelector('.city-input');
const citiesList = document.querySelector('.cities-list');

const getLi = (text) => {
  const li = document.createElement('li');
  li.textContent = text;
  return li;
}
const renderCitiesList = (items) => {
  citiesList.innerHTML = '';
  const cities = items.map(({ title }) => getLi(title));
  cities.forEach((li) => citiesList.append(li));
};

const inputHandle = ({ target: { value } }) => {
  console.log('inputHandle -> value', value);
  if (value) {
    const url = getCityRequestUrl(value);
    $.ajax({
      url,
      type: 'GET',
      crossDomain: true,
      dataType: 'jsonp'
    })
    .done(({ response }) => renderCitiesList(response.items))
    .fail((error) => console.error(error));
  } else {
    citiesList.innerHTML = '';
  }
}

cityInput.addEventListener('input', inputHandle);
