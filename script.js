const searchInput = document.querySelector('.search-container__search');
const addedRepo = document.querySelector('.added-repositories');
const searchContainer = document.querySelector('.search-container');
const body = document.querySelector('body');
const bthClose = document.querySelector('.added-repositories__close');

let repoArray = [];

const debounce = (fn, ms) => {
	let timeout;
	return function (...arguments) {
		const fnCall = () => {
			fn.apply(this, arguments);
		};
		clearTimeout(timeout);
		timeout = setTimeout(fnCall, ms);
	};
};

const checkInputIsEmptyDebounced = debounce(checkInputIsEmpty, 700);

body.addEventListener('click', (event) => {
	const className = event.target.className;
	if (
		className !== 'search-container__search' ||
		className !== 'search-container__item'
	) {
		clearAutocomplite();
	}
});

searchContainer.addEventListener('click', addCard);
searchInput.addEventListener('keyup', checkInputIsEmptyDebounced);
searchInput.addEventListener('keyup', deleteAutocomplite);
searchInput.addEventListener('focusout', deleteAutocomplite);
searchInput.addEventListener('focus', checkInputIsEmptyDebounced);

function deleteAutocomplite(event) {
	if (event.target.value === '') {
		if (document.querySelector('.search-container__list')) {
			document.querySelector('.search-container__list').remove();
		}
	}
}

function checkInputIsEmpty(event) {
	let trim = event.target.value.trim();

	if (trim !== '') {
		const searchList = document.createElement('ul');
		searchList.classList.add('search-container__list');

		if (!document.querySelector('.search-container__list')) {
			searchContainer.appendChild(searchList);
		}

		clearAutocomplite();
		getRepository(event.target.value);
	}
}

function addCard(event) {
	if (event.target.className === 'search-container__item') {
		const cardId = +event.target.id;

		repoArray.forEach((repo) => {
			if (cardId === repo['id']) {
				searchInput.value = '';

				clearAutocomplite();
				createCard(
					repo['name'],
					repo['owner']['login'],
					repo[`stargazers_count`]
				);
			}
		});
	}
}

function createAutocompliteElements(array) {
	const searchList = document.querySelector('.search-container__list');
	let fragment = new DocumentFragment();

	array.forEach((repo) => {
		const item = document.createElement('li');
		item.classList.add('search-container__item');
		item.textContent = `${repo.name}`;
		item.id = `${repo.id}`;
		fragment.appendChild(item);
	});

	return searchList.append(fragment);
}

function clearAutocomplite() {
	document
		.querySelectorAll('.search-container__item')
		.forEach((elem) => elem.remove());
}

async function getRepository(value) {
	repoArray = [];
	if (!value) return;

	await fetch(
		`https://api.github.com/search/repositories?q=${value}&per_page=5`
	)
		.then((response) => response.json())
		.then((res) => {
			res.items.forEach((repo) => repoArray.push(repo));
			createAutocompliteElements(repoArray);
		})
		.catch((err) => console.log(err.message));
}

function createCard(name, owner, stars) {
	const listCard = document.createElement('div');
	listCard.classList.add('added-repositories__card');

	const user = document.createElement('div');
	user.classList.add('added-repositories__user');

	const cardName = document.createElement('p');
	cardName.classList.add('added-repositories__name');
	cardName.textContent = `Name: ${name}`;
	user.append(cardName);

	const cardOwner = document.createElement('p');
	cardOwner.classList.add('added-repositories__owner');
	cardOwner.textContent = `Owner: ${owner}`;
	user.append(cardOwner);

	const cardStars = document.createElement('p');
	cardStars.classList.add('added-repositories__stars');
	cardStars.textContent = `Stars: ${stars}`;
	user.append(cardStars);

	const btn = document.createElement('button');
	btn.classList.add('added-repositories__close');
	btn.setAttribute('type', 'button');

	listCard.append(user);
	listCard.appendChild(btn);

	return addedRepo.append(listCard);
}

function deleteCard(event) {
	const btnClose = event.target.className;
	if (btnClose !== 'added-repositories__close') return;
	const card = event.target.closest('.added-repositories__card');
	card.remove();
}

addedRepo.addEventListener('click', deleteCard);
