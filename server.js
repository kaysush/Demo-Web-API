// Load the modules into our app
var express = require('express');
var bodyParse = require('body-parser');


// Create an instance of express app
var app = express();

// Add the body-parser into express middleware list. This will help us in getting 
// the data that we'll POST to our API.
app.use(bodyParse.urlencoded({extended : true}));
app.use(bodyParse.json());

// Fetch the port from environment variable and if not available use 8000 as default
var port = process.env.PORT || 8000;


//=======================
// Database definition
//=======================
// Import mongoose into our app
var mongoose = require ('mongoose');

// Get the Schema instance
var Schema = mongoose.Schema;

// Connect to our mongo lab instance of database
mongoose.connect('mongodb://kaysush:node@ds021884.mlab.com:21884/products');

// Create product schema
var ProductSchema = new Schema({
	name : String,
	quantity : Number
});

// Create model from our Schema
var Product = mongoose.model('Product' , ProductSchema);

//=======================
// Routes definition
//=======================

// Get the router instance for our app.
var router = express.Router();

// Add a route to our router
router.route("/products")
// Configure what happens when GET request is initiated..
.get(function(request,response){	
	Product.find(function(err, products){
		if(err)
			response.status(500).send(err);
		response.status(200).send(products);
	})
})

.post(function(request, response){
	var product = new Product();
	product.name = request.body.name;
	product.quantity = request.body.quantity;
	product.save(function(err){
		if(err)
			response.status(500).send(err);

		response.status(201).send();
	})
	
})

router.route('/products/:product_id')
.get(function(request, response){
	Product.findById(request.params.product_id, function(err, product){
		if(err)
			response.status(500).send(err);
		if(product != null){
			response.status(200).send(product);
		}
		else
			response.status(404).send();
	})
})

.put(function(request, response){
	Product.findById(request.params.product_id, function(err, product){
		var notFound = false;
		// If product not found create a new one
		if(product == null){
			notFound = true;
			product = new Product();
		}
		product.name = request.body.name;
		product.quantity = request.body.quantity;

		product.save(function(err){
			if(err)
				response.status(500).send(err);
			if(notFound) // Send 201 Created if new resource created.
				response.status(201).send();
			else // Send 200 Ok status if update
				response.status(200).send();
		})
		
	})
})

.delete(function(request, response){
		Product.remove(request.params.product_id , function(err){
			if(err)
				response.status(500).send(err);
			else
				response.status(204).send();
		})
})

// Mount the newly created route at /api location.
// This means now our newly added route will be available at /api/products url.
app.use("/api", router);

// Start the app to listen for requests on given port and log the message to console.
app.listen(port, function(){
	console.log("Server started at %d", port);
});