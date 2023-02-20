const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const BookInstance = require("../models/bookinstance");

const async = require("async");
const { body, validationResult } = require("express-validator");


// Display list of all bookinstances.
exports.bookinstance_list = function (req, res, next) {
  BookInstance.find({}, "book imprint status due_back")
  .sort({ imprint: 1 })
  .populate("book")
  .exec(function (err, list_books) {
    if (err) {
      return next(err);
    }
    //Successful, so render
    res.render("catalog/bookinstance_list", { title: "BookInstances List", bookinstance_list: list_books });
  });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = (req, res) => {
  BookInstance.findById(req.params.id)
    .populate("book")
    .exec(function (err, bookInstance) {
      if (err) {
        return next(err);
      }
      if (bookInstance == null){
        const err = new Error("no encontrado");
        err.status = 404;
        console.log(err)
        return next(err);
      }
      res.render("catalog/bookinstance_detail", { bookInstance: bookInstance });
    });
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = (req, res, next) => {
  Book.find({}, "title").exec((err, books) => {
    if (err) {
      return next(err);
    }
    // Successful, so render.
    res.render("catalog/bookinstance_form", {
      title: "Create BookInstance",
      book_list: books,
    });
  });
};


// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  // Validate and sanitize fields.
  body("book", "Book must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("imprint", "Imprint must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("due_back", "Invalidad due back date.")
  .optional({ checkFalsy: true })
  .isISO8601()
  .toDate(),
  body("status", "Status must not be empty").trim().isLength({ min: 1 }).escape(),
  
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      due_back: req.body.due_back,
      status: req.body.status,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          book(callback) {
            Book.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }
          
          res.render("catalog/bookinstance_form", {
            title: "Create BookInstance",
            book: results.book,
            bookInstance,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Save book.
    bookInstance.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect to new book record.
      res.redirect(bookInstance.url);
    });
  },
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = (req, res) => {
  BookInstance.findById(req.params.id)
  .populate("book")
  .exec(function (err, bookInstance) {
    if (err) {
      return next(err);
    }

    if (bookInstance == null){
        // No results.
        res.redirect("/catalog/bookInstances");
    }

    res.render("catalog/bookinstance_delete", { title: "Delete BookInstance",  bookInstance: bookInstance });
  });
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = (req, res) => {
  //  Delete object and redirect to the list of bookInstances.
  BookInstance.findByIdAndRemove(req.body.bookInstanceid, (err) => {
    if (err) {
      return next(err);
    }
    // Success - go to bookInstance list
    res.redirect("/catalog/bookInstances");
  });
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = (req, res) => {
  async.parallel(
    {
      books(callback){
        Book.find({}, "title").exec(callback);
      },
      bookInstance(callback){
        BookInstance.findById(req.params.id)
        .populate("book")
        .exec(callback);
      }
    },
    (err, results)=>{
      if (err) {
        return next(err);
      }
      if (results.bookInstance == null) {
        // No results.
        const err = new Error("Book not found");
        err.status = 404;
        return next(err);
      }

      res.render("catalog/bookinstance_form", {
        title: "Update BookInstance",
        bookinstance : results.bookInstance,
        book_list: results.books,
      });
    },
  )
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
  // Validate and sanitize fields.
  body("book", "Book must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("imprint", "Imprint must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("due_back", "Invalidad due back date.")
  .optional({ checkFalsy: true })
  .isISO8601()
  .toDate(),
  body("status", "Status must not be empty").trim().isLength({ min: 1 }).escape(),
  
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      due_back: req.body.due_back,
      status: req.body.status,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      res.redirect(`/bookinstance/${req.params.id}/update`);
    }

    BookInstance.findByIdAndUpdate(req.params.id, bookInstance, {}, (err, thebookInstance) => {
      if (err) {
        return next(err);
      }

      // Successful: redirect to book detail page.
      res.redirect(thebookInstance.url);
    });
  },
];
