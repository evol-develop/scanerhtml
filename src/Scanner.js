import React, { useEffect,useState, useRef } from 'react';
import { BrowserQRCodeReader } from '@zxing/library';
import axios from "axios";
import { NotFoundException, ChecksumException, FormatException } from '@zxing/library';
import './css/css.css';

function Scanner({onAtraccionChange,onBoletoChange}) {
  const videoRef = useRef(null);
  const selectRef = useRef(null);
  const [isQRRecognized, setQRRecognized] = useState(false);

  const [boleto, setBoleto] = useState(" ");

  const [atraccionValida,setAtraccionValida]= useState(null);

  function verficarQR(resultado) {

    console.log(resultado);
    
      if (resultado === localStorage.getItem('codigo')) {

      }else{

      if (resultado.startsWith("A") && resultado.length === 4) {

        axios
         .get(`https://api-sac-scanner.azurewebsites.net/api/scanner/GetAtraccionByCodigo/${resultado}`)
           //.get(`https://localhost:44327/api/scanner/GetAtraccionByCodigo/${resultado}`)
          .then((respuesta) => {
      
            if (respuesta.data) {

              let atraccionLocal = respuesta.data.replace(/\s/g, "");
             
              localStorage.setItem('codigo_atraccion', resultado);
              localStorage.setItem('atraccion', atraccionLocal); // Guarda la atracción en localStorage
              onAtraccionChange(atraccionLocal);
              /* setAtraccion(atraccionLocal); */
              setAtraccionValida(true);

              setTimeout(() => {
                setAtraccionValida(null);
                //window.location.reload();
              }, 1000);


            } else {

              localStorage.removeItem('codigo_atraccion');
              localStorage.removeItem('atraccion'); // Elimina la atracción de localStorage
              setAtraccionValida(false);

              setTimeout(() => {
                setAtraccionValida(null);
              }, 2000);

            }
          })
          .catch((error) => {
            console.error("", error);
          });

      } else {
        
        let codigo_atraccion = localStorage.getItem('codigo_atraccion');

          if (codigo_atraccion) {

          axios
             .get(`https://api-sac-scanner.azurewebsites.net/api/scanner/ValidarQR/${resultado}`)
            //.get(`https://localhost:44327/api/scanner/ValidarQR/${resultado}`)
            .then((respuesta) => {
              if (respuesta.data) {
                console.log(respuesta.data);

                localStorage.setItem('codigo', resultado);

                let user = localStorage.getItem("user");

                onBoletoChange('QR VÁLIDO');
                setBoleto('QR VÁLIDO');
                setTimeout(() => {
                    setBoleto(" ");
                    onBoletoChange(" ");
                    }, 2000);

                axios
               .get(`https://api-sac-scanner.azurewebsites.net/api/scanner/RegistrarIngreso/${resultado}/${codigo_atraccion}/${user}`)
                     // .get(`https://localhost:44327/api/scanner/RegistrarIngreso/${resultado}/${codigo_atraccion}/${user}`)
                  .then((respuesta) => {
                 
                    if(respuesta.data){
                     
                    }
                    else{

                    }
                   
                  })
                  .catch((error) => {
                    console.error("", error);
                  });

              } else {
                onBoletoChange("QR INVÁLIDO");
                setBoleto("QR INVÁLIDO");
                
                setTimeout(() => {
                  setBoleto(" ");
                  onBoletoChange(" ");
                }, 5000);
              }

            })
            .catch((error) => {
              console.error("", error);
            });

        } else {
          onBoletoChange("NOT ATRACCION");
          setBoleto("NOT ATRACCION");
          setTimeout(() => {
            setBoleto(" ");
            onBoletoChange(" ");
          }, 5000);

        }
      }
    }
  }

  useEffect(() => {


    if(localStorage.getItem("atraccion") !== null || localStorage.getItem("atraccion") !== undefined || localStorage.getItem("atraccion") !== " "){
      onAtraccionChange(localStorage.getItem("atraccion"));
    }

    const codeReader = new BrowserQRCodeReader();
    let selectedDeviceId;

    const decodeContinuously = (codeReader, selectedDeviceId) => {
      codeReader.decodeFromInputVideoDeviceContinuously(selectedDeviceId, videoRef.current.id, (result, err) => {
        if (result) {
           // console.log(result);

           setQRRecognized(true);

          // Después de 5 segundos, restablece el estado a `false`
          setTimeout(() => {
            setQRRecognized(false);
          }, 1000);

          console.log(result.text);
         // verficarQR(result.text);
        }

      });
    };

    /* codeReader.getVideoInputDevices()
      .then((videoInputDevices) => {
        selectedDeviceId = videoInputDevices[0].deviceId;
        if (videoInputDevices.length >= 1) {
          videoInputDevices.forEach((element) => {
            const sourceOption = document.createElement('option');
            sourceOption.text = element.label;
            sourceOption.value = element.deviceId;
            selectRef.current.appendChild(sourceOption);
          });

          selectRef.current.onchange = () => {
            selectedDeviceId = selectRef.current.value;
          };
        }

        decodeContinuously(codeReader, selectedDeviceId);
      })
      .catch((err) => {
        console.error(err);
      }); */

      codeReader.getVideoInputDevices()
      .then((videoInputDevices) => {
        if (videoInputDevices.length >= 1) {
          // Itera sobre los dispositivos de video hasta encontrar la cámara trasera
          for (let i = 0; i < videoInputDevices.length; i++) {
            if (videoInputDevices[i].label.toLowerCase().includes('back')) {
              selectedDeviceId = videoInputDevices[i].deviceId;
              break;
            }
          }
  
          // Si no se encontró la cámara trasera, usa el deviceId del primer dispositivo de video
          if (!selectedDeviceId) {
            selectedDeviceId = videoInputDevices[0].deviceId;
          }
  
          // ...
  
          decodeContinuously(codeReader, selectedDeviceId);
        }
      })
      .catch((err) => {
        console.error(err);
      });

  }, []);

  
  return (
    <div style={{textAlign:'center',display:'flex',justifyContent:'center',backgroundColor: boleto === " " ? ("white"):(  boleto === "QR VÁLIDO" ?("green"):("red") )}}>
     
        <div>
            {boleto === "NOT ATRACCION" && (
                <h6 style={{ color: "white",fontSize:"20px" }}>No hay ninguna atracción seleccionada</h6>
            )}
             {boleto !== "NOT ATRACCION" && (<h6 style={{ color: "white",fontSize:"20px" }}>{boleto}</h6> )}
           {/* <video id="video" width="500" height="500"  ref={videoRef}></video> */}
           <div style={{ position: 'relative', width: '500px', height: '500px' }}>
            <video id="video" width="500" height="500" ref={videoRef}></video>
              <div className="scanner-border" style={{
              boxSizing: 'border-box',
              height: '50%', // Ajusta el tamaño del div del borde
              width: '50%', // Ajusta el tamaño del div del borde
              position: 'absolute',
              top: '25%', // Centra el div del borde
              left: '25%', // Centra el div del borde
            }}>
              <div className={`corner top-left ${isQRRecognized ? 'recognized' : ''}`}></div>
              <div className={`corner top-right ${isQRRecognized ? 'recognized' : ''}`}></div>
              <div className={`corner bottom-left ${isQRRecognized ? 'recognized' : ''}`}></div>
              <div className={`corner bottom-right ${isQRRecognized ? 'recognized' : ''}`}></div>
            </div>
          </div>
        </div>
        <br></br>
       
   

    {/* {atraccionValida ? (<h4 style={{ color: "white" ,textAlign:'center'}}>{'Atracción asignada'}</h4>):(<></>)}*/}

        <div id="sourceSelectPanel" style={{ display: 'none' }}>
          <label htmlFor="sourceSelect">Change video source:</label>
          <select id="sourceSelect" style={{ maxWidth: '400px' }} ref={selectRef}></select>
        </div>
    </div>
  );
}

export default Scanner;
