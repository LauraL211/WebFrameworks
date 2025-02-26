const mongoose = require('mongoose');
const request = require('request');
const apiOptions = { 
server : 'http://localhost:3000' 
}; 
if (process.env.NODE_ENV === 'production') { 
apiOptions.server = 'https://pure-temple-67771.render.com'; 
}

const Loc = mongoose.model('Location');

const _buildLocationList = function(req, res, results) {
  let locations = [];
  results.forEach((doc) => {
    locations.push({
      distance: doc.dist,
      name: doc.name,
      address: doc.address,
      rating: doc.rating,
      facilities: doc.facilities,
      _id: doc._id
    });
  });
  return locations;
};

const locationsListByDistance = function (req, res) {
  const lng = parseFloat(req.query.lng);
  const lat = parseFloat(req.query.lat);
  const maxDistance = parseFloat(req.query.maxDistance);
  const point = {
    type: "Point",
    coordinates: [lng, lat]
  };
  const geoOptions = {
    spherical: true,
    maxDistance: 20000,
    num: 10
  };
  if (!lng || !lat || !maxDistance) {
    console.log('locationsListByDistance missing params');
    res
      .status(404)
      .json({
        message : 'lng, lat and maxDistance query parameters are all required'
      });
    return;
  }
  Loc.aggregate(
  [
	{	
		'$geoNear': {
                    'near': point,
                    'spherical': true,
                    'distanceField': 'dist',
                    'maxDistance': 20000
                }
            }
        ]).then((results, err)=>{
			console.log(results);
			const locations = _buildLocationList(req, res, results);
			console.log('Geo Results', results);
			res
			.status(200)
			.json(locations);
			});

};

const locationsCreate = function (req, res) {
	console.log(req.body.coords);
  Loc.create({
    name: req.body.name,
    address: req.body.address,
    facilities: req.body.facilities.split(","),
    coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
    openingTimes: [{
      days: req.body.days1,
      opening: req.body.opening1,
      closing: req.body.closing1,
      closed: req.body.closed1,
    }, {
      days: req.body.days2,
      opening: req.body.opening2,
      closing: req.body.closing2,
      closed: req.body.closed2,
    }]
  }).then((location, err) => {
    if (err) {
      res
        .status(400)
        .json(err);
    } else {
      res
        .status(201)
        .json(location);
    }
  });
};

const locationsReadOne = function (req, res) {
  if (req.params && req.params.locationid) {
    Loc
      .findById(req.params.locationid)
      .then((location, err) => {
        if (!location) {
          res	
            .status(404) 
            .json({	
              "message": "locationid not found"
            });	 
          return;
        } else if (err) {
          res	
            .status(404) 
            .json(err); 
          return; 	
        }
        res		
          .status(200)
          .json(location);
      });
  } else {		
    res		
      .status(404) 	
      .json({	
        "message": "No locationid in request"
      });		
  }
};

const locationsUpdateOne = function (req, res) {
  if (!req.params.locationid) {
    res
      .status(404)
      .json({
        "message": "Not found, locationid is required"
      });
    return;
  }
  Loc
    .findById(req.params.locationid)
    .select('-reviews -rating')
    .then((location, err) => {
      if (!location) {
        res
          .json(404)
          .status({
            "message": "locationid not found"
          });
        return;
      } else if (err) {
        res
          .status(400)
          .json(err);
        return;
      }
      location.name = req.body.name;
      location.address = req.body.address;
      location.facilities = req.body.facilities.split(",");
      location.coords = [
        parseFloat(req.body.lng),
        parseFloat(req.body.lat)
      ];
      location.openingTimes = [{
        days: req.body.days1,
        opening: req.body.opening1,
        closing: req.body.closing1,
        closed: req.body.closed1,
      }, {
        days: req.body.days2,
        opening: req.body.opening2,
        closing: req.body.closing2,
        closed: req.body.closed2,
      }];
      location.save((err, location) => {
        if (err) {
          res
            .status(404)
            .json(err);
        } else {
          res
            .status(200)
            .json(location);
        }
      });
    }
  );
};

const locationsDeleteOne = function (req, res) {
  const locationid = req.params.locationid;
  if (locationid) {
    Loc
      .findByIdAndRemove(locationid) 
      .then((location, err) => {
          if (err) {
            res
              .status(404)
              .json(err);
            return;
          }
          res
            .status(204)
            .json(null);
        }
    );
  } else {
    res
      .status(404)
      .json({
        "message": "No locationid"
      });
  }
};

const locationsReadAll = function (req, res) {
  
  Loc
    .find()
    .then((location, err) => {
      if (!location) {
        res	
          .status(404) 
          .json({	
            "message": "locationid not found"
          });	 
        return;
      } else if (err) {
        res	
          .status(404) 
          .json(err); 
        return; 	
      }
      res		
        .status(200)
        .json(location);
    });
};

module.exports = {
locationsListByDistance,
locationsCreate,
locationsReadOne,
locationsUpdateOne,
locationsDeleteOne,
locationsReadAll
};