import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Scanner from "./Scanner";
import '@fortawesome/fontawesome-free/css/all.min.css'; 
import 'bootstrap-css-only/css/bootstrap.min.css'; 
import logotipo from './logo.jpeg';
import logotipo2 from './logotipo.jpg';

function App() {
 
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [usuarioCorrecto, setUsuarioCorrecto] = useState(null);
 // const [isValid, setIsValid] = useState(false);

 
  const handleSubmit = (e) => {
    e.preventDefault();

    axios
    //.get(`https://api-sac-scanner.azurewebsites.net/api/scanner/ValidarUsuario/${email}/${pass}`)
    .get(`https://localhost:44327/api/scanner/ValidarUsuario/${email}/${pass}`)
    .then((respuesta) => {
      //console.log(respuesta);

      if(respuesta.data != "NOT"){
        
        localStorage.setItem("user", respuesta.data);
        localStorage.setItem("usuario_logeado", true);
        setUsuarioCorrecto(true)
        setUsuario_logeado(true);
      }
      else{

        //setIsValid(false);
        //localStorage.setItem("usuario_logeado", false);
        setUsuario_logeado(false);
        setUsuarioCorrecto(false);
      }
     
    })
    .catch((error) => {
      console.error("", error);
      //setIsValid(false);
     
      setUsuario_logeado(false);
      setUsuarioCorrecto(false);
    });


  };
 
  const [atraccion, setAtraccion] = useState(localStorage.getItem('atraccion')==='true'?setAtraccion:true); //
  const [usuario_logeado, setUsuario_logeado] = useState(false);
  const [boleto, setboleto] = useState(" ");

  useEffect(() => {

var user =  localStorage.getItem('usuario_logeado');

   user === 'true'  ? setUsuario_logeado(true) : setUsuario_logeado(false);
  

  }, []);


   return (
    <div className="App" style={{ maxWidth: '100%', overflowX: 'hidden'}} >
      <div  style={{ maxWidth: '100%', overflowX: 'hidden', backgroundColor: boleto === " " ? ("white"):(  boleto === "QR VÁLIDO" ?("green"):("red") ) }} >
      
      <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: "fixed", 
      top: 0, 
      width: "100%", 
      backgroundColor: "#b0c4de", 
      lineHeight: '60px'
    }}>
      <img src={logotipo2} style={{width:'5vh',height:'5vh',margin:'10px'}}/>
      <h6 style={{ margin: 0 }}> {!usuario_logeado ? (<b>SAC CONTROL DE ACCESO</b>):(<>{atraccion}</>)} </h6>
      {usuario_logeado ? (
        <i className="fas fa-sign-out-alt" style={{color:'red',padding:'20px'}} onClick={() => { localStorage.clear();   localStorage.setItem("usuario_logeado", false); setAtraccion('');  localStorage.removeItem('atraccion'); setUsuario_logeado(false);}}></i>
      ) : (
        <div style={{width:'5vh',height:'5vh',margin:'10px'}}></div> // Un div vacío para mantener el espacio
      )}
      </div>

      {usuario_logeado ?(
      <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh', 
        }}>
        <Scanner onAtraccionChange={setAtraccion} onBoletoChange={setboleto} />
        </div>):(<>
          <div className="container w-100" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            height: '80vh' ,
            alignItems: 'center',
          
          }} >
          
            <img src={logotipo} style={{width:'50vh',height:'20vh',margin:'20px'}}/>
            <h5 >Iniciar sesión</h5>

              <form onSubmit={handleSubmit} style={{backgroundColor: "#b0c4de", padding:'10px', display: 'flex', flexDirection: 'column', alignItems: 'center',width:'50vh'}}>
                <div className="form-group">
                  <label>Correo</label>
                  <input type="email" required className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp"  onChange={(e) => setEmail(e.target.value)}/>
                </div>
                <div className="form-group">
                  <label>Contraseña</label>
                  <input type="password" required className="form-control" id="password"  onChange={(e) => setPass(e.target.value)}/>
                </div>

                {usuarioCorrecto === null ? <></> : (usuarioCorrecto ? <></> : <h6 style={{color:'red'}}>Usuario o contraseña inválidos</h6>)}
                <button type="submit" className="btn btn-primary">Entrar</button>
            </form>

          </div>
        </>
    )}
      </div>
    </div>

    
  );
}

export default App;