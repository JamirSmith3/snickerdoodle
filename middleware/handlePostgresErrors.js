const ERRORS = {
  INVALID_TYPE: "22P02",
  UNIQUE_VIOLATION: "23505",
  FOREIGN_KEY_VIOLATION: "23503",
  NOT_NULL: "23502",
};

export default function handlePostgresErrors(err, req, res, next) {
  switch (err.code) {
    case ERRORS.INVALID_TYPE:
      return res.status(400).json({ error: err.message });
    case ERRORS.NOT_NULL:
      return res.status(400).json({ error: err.message });
    case ERRORS.FOREIGN_KEY_VIOLATION:
      return res.status(400).json({ error: err.detail });
    case ERRORS.UNIQUE_VIOLATION:
      return res.status(409).json({ error: err.detail });
    default:
      return next(err);
  }
}