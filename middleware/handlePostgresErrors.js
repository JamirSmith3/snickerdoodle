const ERRORS = {
  INVALID_TYPE: "22P02",
  UNIQUE_VIOLATION: "23505",
  FOREIGN_KEY_VIOLATION: "23503",
};

export default function handlePostgresErrors(err, req, res, next) {
  switch (err.code) {
    case ERRORS.INVALID_TYPE:
      return res.status(400).send(err.message);
    case ERRORS.FOREIGN_KEY_VIOLATION:
    case ERRORS.UNIQUE_VIOLATION:
      return res.status(400).send(err.detail);
    default:
      next(err);
  }
}
