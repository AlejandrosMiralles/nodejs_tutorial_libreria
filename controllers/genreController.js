const Genre = require("../models/genre");
const Book = require("../models/book");

const async = require("async");
const { body, validationResult } = require("express-validator");



// Display list of all Genre.
exports.genre_list = (req, res) => {
  Genre.find({}, "name")
    .sort({ name: 1 })
    .exec(function (err, genres_books) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("catalog/genres_list", { title: "Genres List", genres_list: genres_books });
    });
};

// Display detail page for a specific Genre.
exports.genre_detail = (req, res, next) => {
  async.parallel(
    {
      genre(callback) {
        Genre.findById(req.params.id).exec(callback);
      },

      genre_books(callback) {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.genre == null) {
        // No results.
        const err = new Error("Genre not found");
        err.status = 404;
        return next(err);
      }
      // Successful, so render
      res.render("catalog/genre_detail", {
        title: "Genre Detail",
        genre: results.genre,
        genre_books: results.genre_books,
      });
    }
  );
};


// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
  res.render("catalog/genre_form", { title: "Create Genre" });
};


// Handle Genre create on POST.
exports.genre_create_post = [
  // Validate and sanitize the name field.
  body("name", "Genre name required").trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    const genre = new Genre({ name: req.body.name });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("catalog/genre_form", {
        title: "Create Genre",
        genre,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      Genre.findOne({ name: req.body.name }).exec((err, found_genre) => {
        if (err) {
          return next(err);
        }

        if (found_genre) {
          // Genre exists, redirect to its detail page.
          res.redirect(found_genre.url);
        } else {
          genre.save((err) => {
            if (err) {
              return next(err);
            }
            // Genre saved. Redirect to genre detail page.
            res.redirect(genre.url);
          });
        }
      });
    }
  },
];


// Display Genre delete form on GET.
exports.genre_delete_get = (req, res) => {
  async.parallel(
    {
      genre(callback) {
        Genre.findById(req.params.id).exec(callback);
      },
      genres_books(callback) {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.genre == null) {
        // No results.
        res.redirect("/catalog/genres");
      }
      // Successful, so render.
      res.render("catalog/genre_delete", {
        title: "Delete Genre",
        genre: results.genre,
        genre_books: results.genres_books,
      });
    }
  );
};

// Handle Genre delete on POST.
exports.genre_delete_post = (req, res) => {

  async.parallel(
    {
      genre(callback) {
        Genre.findById(req.params.id).exec(callback);
      },
      genres_books(callback) {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.genres_books.length > 0 ) {
        // Author has books. Render in same way as for GET route.
        res.render("catalog/genre_delete", {
          title: "Delete Genre",
          genre: results.genre,
          genre_books: results.genres_books,
        });
        return ;
      }
      
        // Genre has no books. It can be deleted
        Genre.findByIdAndRemove(req.body.genreid, (err) => {
          if (err) {
            return next(err);
          }
          // Success - go to book list
          res.redirect("/catalog/genres");
        });
    }
  );};

// Display Genre update form on GET.
exports.genre_update_get = (req, res, next) => {
  Genre.findById(req.params.id)
  .exec((err, found_genre) =>{
    if (err) {
      return next(err);
    }
    if (found_genre == null){
      // No results.
      const err = new Error("Genre not found");
      err.status = 404;
      return next(err);
    }
    
    res.render("catalog/genre_form", {
      title: "Update Genre",
      genre: found_genre,
    });
  });
};

// Handle Genre update on POST.
exports.genre_update_post = [

  // Validate and sanitize the name field.
  body("name", "Genre name required").trim().isLength({ min: 1 }).escape(),



 (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    const genre = new Genre({ name: req.body.name, _id: req.params.id, });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("catalog/genre_form", {
        title: "Create Genre",
        genre,
        errors: errors.array(),
      });
      return;
    }
    
    // Data from form is valid. Update the record.
    Genre.findByIdAndUpdate(req.params.id, genre, {}, (err, genreUpdated) => {
      if (err) {
        return next(err);
      }

      // Successful: redirect to book detail page.
      res.redirect(genreUpdated.url);
    });
  }

];
