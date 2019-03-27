const express = require('express');
const hbs = require('hbs')
const axios = require('axios');
const fs = require('fs')


var app = express();


app.use((request, response, next) => {
	var time = new Date().toString();
	var log = `${time}: ${request.method} ${request.url}`
	fs.appendFile('server.log', log + '\n', (error) => {
		if (error) {
			console.log('Unable to log message');
		}
	});
	// console.log(`${time}: ${request.method} ${request.url}`);
	next();
});


app.use((request, response, next) => {
	var time = new Date().toString();
	var log = `${time}: ${request.method} ${request.url}`
	response.render('error.hbs')
	fs.appendFile('server.log', log + '\n', (error) => {
		if (error) {
			console.log('Unable to log message');
		}
	});
	//console.log(`${time}: ${request.method} ${request.url}`);
});






app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));

hbs.registerPartials(__dirname + '/views/partials');

hbs.registerHelper('getCurrentYear', () => {
	return new Date().getFullYear();
})



app.get('/home', (request, response) => {
	// response.send('<a href="about.html"> About me </a>' + '<br>' + '<a href="currency"> Currency </a>')
	response.render('home.hbs', {
		title: 'Home page',
		pages: ['info', 'currency'],
	})
});


app.get('/info', (request, response) => {
	var current_page = 'home_page'
	response.render('about.hbs', {
		title: 'About page',
		pages: ['home', 'currency']
	});
});

const getRates = () => {
	return new Promise((resolve, reject) => {
			if (axios.get('https://api.exchangeratesapi.io/latest')) {
				resolve(axios.get('https://api.exchangeratesapi.io/latest'))
			} else {
				reject('Not acceptble currency rates')
			}
	}) 

}
const getContries = (id1) => {
	return new Promise((resolve, reject) => {
		if (axios.get('https://restcountries.eu/rest/v2/currency/' + id1)) {
			resolve(axios.get('https://restcountries.eu/rest/v2/currency/' + id1))
		} else {
			reject('Invalid currency')
		}
	})
}
const getExchange = async (id1, id2, amount) => {

	const rates = await getRates(id2)
	const countries = await getContries(id1)

	return new Promise((resolve, reject) => {
		if (isNaN(amount) == true) {
			reject("Invalid amount")
		}
		else if (eval('rates.data.rates.' + id1) == undefined) {
			reject("Invlaid country")
		} else {
			// const rates = await getRates()
						const con = []
			for (i = 0; i < eval('countries.data').length; i++) {
				con.push((countries.data[i].name))


			}
			const exchange = amount * eval('rates.data.rates.' + id2)
		


			resolve(amount + ' ' + id1 + ' is worth ' + exchange + ' ' + id2 
			+ '. You can spend it in the following countries: ' + con)

		}
	})
	}


app.get('/currency', (request, response) => {
	getExchange('USD', 'CAD', 100).then((rates) => {
	response.render('currency.hbs', {
		title: 'Currency',
		currency: rates,
		pages: ['home', 'info']
	});
}).catch((e) => {
	response.send(e);
})
	})


app.listen(8080, () => {
	console.log('Server is up on the port 8080');
});

