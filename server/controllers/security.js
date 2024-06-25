const jwt = require("jsonwebtoken");

module.exports = function SecurityController(UserService) {
  return {
    login: async (req, res, next) => {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({ error: "L'email et le mot de passe sont des champs obligatoires." });
        }
        
        const user = await UserService.login(email, password);
        const token = jwt.sign(
          { id: user.id, login: user.login, isValid: user.isValid },
          process.env.JWT_SECRET,
          {
            expiresIn: "3h",
          }
        );
        res.json({ token });
      } catch (err) {
        next(err);
      }
    },
    logout: async (req, res, next) => {
      try {
        res.status(200).json({ message: 'Vous êtes déconnecté.' });
      } catch (err) {
        next(err);
      }
    },
    register: async (req, res, next) => {
      try {
        const { login, name, surname, email, password, Birthdate } = req.body;

        if (!login || !email || !password || !name || !surname || !Birthdate) {
          return res.status(400).json({ error: "Veullez remplir les champs sont des champs obligatoires." });
        }

        const oldUser = await UserService.findOne({ email });
        if (oldUser) {
          return res.status(409).send({ error: "Un utilisateur avec cette adresse e-mail existe déjà." });
        }

        const user = await UserService.create({
          login,
          email,
          password,
          name,
          surname,
          Birthdate
        });

        const token = jwt.sign(
          { id: user.id, email: user.email, isValid: user.isValid ,name: user.name, surname: user.surname, login: user.login, Birthdate: user.Birthdate},
          process.env.JWT_SECRET,
          {
            expiresIn: "2h",
          }
        );

        user.password = password;
        user.token = token;
        await user.save();

        return res.status(201).json({ message: "Votre compte a été créé avec succès. Veuillez vérifier votre boîte de réception pour activer votre compte." });
      }
      catch (err) {
        next(err);
      }
    },
  };
};
