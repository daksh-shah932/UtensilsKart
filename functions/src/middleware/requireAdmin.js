/**
 * Middleware: checks that req.user (set by requireAuth) has role === "admin".
 * Role is embedded in the JWT payload — no extra Firestore lookup needed.
 * Must always be used AFTER requireAuth.
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
}

module.exports = { requireAdmin };
