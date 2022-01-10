const list = document.querySelector('ul');
const form = document.querySelector('form');
const button = document.querySelector('.btn-warning');

// SHOWING DATA TO UI
const addRecipe = (recipe, id) => {
	let time = recipe.created_at.toDate().toLocaleString();
	let html = `
		<li data-id="${id}" class="mb-3">
			<div>
				<div class="d-flex align-items-center justify-content-between mb-1">
					<h5 class="m-0">${recipe.title}</h5>
					<button class="btn btn-sm btn-danger">
						&#x2715
					</button>
				</div>
				<p class="m-0" style="text-align:justify;">${recipe.instructions}</p>
				<small class="d-block text-end text-muted">${time}</small>
			</div
		</li>
	`;
	
	list.innerHTML += html;
};

// DELETING DATA FROM UI
const deleteRecipe = (id) => {
	const recipes = document.querySelectorAll('li');
	recipes.forEach(recipe => {
		if(recipe.getAttribute('data-id') === id) {
			recipe.remove();
		}
	})
};

// REAL-TIME LISTENER TO SYNC DB-UI
const unsub = db.collection('recipes').onSnapshot((snapshot) => {
	snapshot.docChanges().forEach(change => {
		const doc = change.doc;
		if(change.type === 'added') {
			addRecipe(doc.data(), doc.id);
		} else if(change.type === 'removed') {
			deleteRecipe(doc.id);
		}
	})
});

// ADDING DATA TO DATABASE
form.addEventListener('submit', e => {
	// Prevent default action (=refresh)
	e.preventDefault();
	
	const now = new Date();
	const recipe = {
		title: form.recipe.value.trim(),
		instructions: form.instructions.value.trim(),
		created_at: firebase.firestore.Timestamp.fromDate(now)
	};
	
	db.collection('recipes').add(recipe)
		.then(() => console.log('Recipe added'))
		.catch(error => console.log(error));
		
	form.reset();
});

// DELETING DATA FROM DATABASE
list.addEventListener('click', e => {
	if(e.target.tagName === 'BUTTON') {
		const id = e.target.parentElement.parentElement.parentElement.getAttribute('data-id');
		db.collection('recipes').doc(id).delete()
			.then(() => console.log('Recipe deleted!'))
			.catch(error => console.log(error));
	}
});

// UNSUB-UNSYNC FROM DB CHANGES
button.addEventListener('click', () => {
	unsub();
	console.log('Unsubscribed from collection changes!');
})