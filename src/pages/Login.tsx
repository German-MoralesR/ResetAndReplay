import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/loginStyles.css";

interface LoginProps { // propiedad que puede recibir un login
  onLoginSuccess?: () => void; // función que Login puede llamar cuando el login fue exitoso. 
}

//declara tu componente funcional
//recibe el componente, en este caso solo onLoginSuccess.
const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => { 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  //estado guarda los errores de validación, Inicialmente es {} ningún error
  const [errors, setErrors] = useState<{ email?: string; password?: string; login?: string }>({});
  const navigate = useNavigate(); // Trae la función de React Router que permite redireccionar a otra ruta sin recargar la página.
// función interna que verifica que los campos estén correctos antes de enviar el formulario.
  const validate = (): boolean => {//Devuelve un valor de tipo boolean (true o false).
  const newErrors: { email?: string; password?: string } = {};//es un objeto vacío {} al principio.
  //Esto crea un objeto temporal donde guardaremos los mensajes de error del formulario.


    if (!email) { //Comprueba si la variable email está vacía (""), Cadena vacía "",null,undefined
      newErrors.email = "El correo es obligatorio"; // Si el email está vacío, agregamos un mensaje de error en el objeto newErrors.
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) { // bloque verifica que el email tenga formato válido usando una expresión regular
      newErrors.email = "Formato de correo inválido";// si la verificacion falla agragamos el siguiente error
    }

    if (!password) {//Comprueba si la variable email está vacía (""), Cadena vacía "",null,undefined
      newErrors.password = "La contraseña es obligatoria";
    } else if (password.length < 4) {//Si la contraseña no está vacía, pero su longitud es menor a 4 caracteres, entra en este bloque.
      newErrors.password = "La contraseña debe tener al menos 4 caracteres";
    }

    //Con esto, el componente se vuelve a renderizar y los mensajes de error se muestran debajo de los inputs.
    //devuelve un array con todas las claves del objeto
    //Si no hay errores, length === 0 → devuelve true → el formulario es válido
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //Evita que el formulario se envíe de forma tradicional, lo cual recargaría la página.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return; // si hay errores, no sigue

    // validación de credenciales de prueba
    if (email === "vega@gmail.com" && password === "1234") {
      localStorage.setItem("isLoggedIn", "true");//Guarda en el localStorage del navegador que el usuario está logueado.
      setErrors({});// limpia errores
      //Llama a la función que viene de App.tsx para actualizar el estado global isLoggedIn y mostrar “Cerrar sesión” en la navbar.
      if (onLoginSuccess) onLoginSuccess();
      navigate("/home"); // redirige al Home
    } else {
      setErrors({ login: "Correo o contraseña incorrectos" }); // Si las credenciales no coinciden, asigna un error general de login.
    }
  };

    return (
        <form id="loginForm" onSubmit={handleSubmit}>
            <h2>Iniciar Sesión</h2>

            <div className="form-input usuario">
                <label htmlFor="email">Correo</label>
                <input 
                    type="email" 
                    id="email" 
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                <p className="mensajeError"></p>
            </div>

            <div className="form-input password">
                <label htmlFor="password">Contraseña</label>
                <input 
                    type="password" 
                    id="password"
                    className={`form-control ${errors.password ? "is-invalid" : ""}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                <p className="mensajeError"></p>
            </div>
            {errors.login && <p className="text-danger text-center">{errors.login}</p>}

            <button type="submit">Ingresar</button>
            <a href="registrate.html" className="btn btn-primary volver-btn" role="button">Registrarse</a>
        </form>
    );
}

export default Login;