import React from "react";

import "../styles/signInStyles.css";
import { Link } from "react-router-dom";

const SignIn: React.FC = () => {
    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    };
  return (
    <div className="abs-center">
        <form className="form" id="form" onSubmit={handleSubmit}>
            <div>         
               <div className="form-input nombre">
                   <label htmlFor="nombre">Nombre Completo</label>
                   <input type="text" id="nombre"/>
                   <p className="mensajeError"></p>
               </div>              
               <div className="form-input correo">
                   <label htmlFor="nombre">Correo</label>
                   <input type="text" id="correo"/>
                   <p className="mensajeError"></p>
               </div>
               <div className="form-input nombre_usu">
                   <label htmlFor="nombre_usu">Nombre Usuario</label>
                   <input type="text" id="nombre_usu"/>
                   <p className="mensajeError"></p>
               </div>

               <div className="form-input fec_nac">
                   <label htmlFor="fec_nac">Fecha de nacimiento</label>
                   <input type="date" id="fec_nac"/>
                   <p className="mensajeError"></p>
               </div>

               
               <div className="form-input password">
                   <label htmlFor="nombre_usu">Contraseña</label>
                   <input type="password" id="password"/>
                   <p className="mensajeError"></p>
               </div>
               <div className="form-input cPassword">
                   <label htmlFor="nombre_usu">Confirmar Contraseña</label>
                   <input type="password" id="cPassword"/>
                   <p className="mensajeError"></p>
               </div>
               <div className="form-input telefono">
                   <label htmlFor="nombre_usu">Telefono (opcional)</label>
                   <input type="text" id="telefono"/>
                   <p className="mensajeError"></p>
               </div>

               <div className="form-input termCond">
                   <label htmlFor="nombre_usu">Terminos y condiciones</label>
                   <input type="checkbox" id="termCond"/>
                   <p className="mensajeError"></p>
               </div>
            </div>

            {/*<!-- Bloque de acciones -->*/}
            <div className="form-actions d-flex">
                {/*<!-- Botón Volver -->*/}
                <Link to="/login" className="btn btn-primary volver-btn" role="button">Volver</Link>
            
                {/*<!-- Botón Enviar -->*/}
                <input type="submit" className="btn btn-primary" value="Enviar"/>
            </div>
        </form>
        

    </div>
  );
}

export default SignIn;