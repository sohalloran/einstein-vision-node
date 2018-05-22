import React, {
  Component
} from 'react';
import Dropzone from 'react-dropzone';
import classNames from 'classnames';
import superagent from 'superagent';
import EXIF from 'exif-js';
import Leaflet from 'leaflet'

import './app.css';
import Spinner from './spinner';
import Predictions from './predictions';
import UploadTarget from './upload-target';
import LeafletMap from './leafletMap';
import { isNull, isUndefined } from 'util';

class App extends Component {
  
  state = {
    files: [],
    isProcessing: false,
    uploadError: null,
    uploadResponse: null,
    wRatio: 0,
    hRatio: 0,
    lat: 0,
    lng: 0,
    allMetaData: '',
    zoom: 13
  }
          
  updateCanvas() {
    const response = this.state.uploadResponse;
    const predictions = response.probabilities;

    let img = new Image();
    const file = this.state.files[0];
    const context = this.refs.canvas.getContext('2d');
    let height = 900;
    let width = 900;
    
    img.src = file && file.preview; 
    img.onload = () => {
      
      EXIF.getData(img, () => {
        var toDecimal = function (number) {
          if (isNull(number) || isUndefined(number)) return 0;
          return number[0].numerator + number[1].numerator /
              (60 * number[1].denominator) + number[2].numerator / (3600 * number[2].denominator);
        };
        var allMetaData = EXIF.getAllTags(img);
        console.log(allMetaData);
        var orientation = EXIF.getTag(img, "Orientation");
        var lng = toDecimal(EXIF.getTag(img, 'GPSLongitude'));
        var lat = toDecimal(EXIF.getTag(img, 'GPSLatitude'));
        this.setState({
          lat:lat,
          lng:lng,
          allMetaData:JSON.stringify(allMetaData, null, 2)
        });
        
        switch (orientation) {
          case 2: context.transform(-1, 0, 0, 1, width, 0); break;
          case 3: context.transform(-1, 0, 0, -1, width, height ); break;
          case 4: context.transform(1, 0, 0, -1, 0, height ); break;
          case 5: context.transform(0, 1, 1, 0, 0, 0); break;
          case 6: context.transform(0, 1, -1, 0, height , 0); break;
          case 7: context.transform(0, -1, -1, 0, height , width); break;
          case 8: context.transform(0, -1, 1, 0, 0, width); break;
          default: break;
        }

        context.drawImage(img, 0, 0, img.width, img.height, 0, 0, 900, 900);

        let wRatio = width / img.width;
        let hRatio = height / img.height;
        switch (orientation) {
          case 6: context.transform(0, -1, 1, 0, 0, width); break;
        }
        for (let i = 0; i < predictions.length; i++) {
          let boundingBox = predictions[i].boundingBox;
          let minX = Math.round(boundingBox.minX * wRatio);
          let minY = Math.round(boundingBox.minY * hRatio);
          let maxX = Math.round((boundingBox.maxX - boundingBox.minX) * wRatio);
          let maxY = Math.round((boundingBox.maxY - boundingBox.minY) * hRatio);
          context.beginPath();
          context.rect(minX, minY, maxX, maxY);
          context.lineWidth = 1;
          context.strokeStyle = 'yellow';
          context.stroke();
          context.font = "10px Arial";
          context.fillStyle = 'yellow';
          context.fillText(Math.round(predictions[i].probability * 100)+'%',minX, minY);
        }

        this.setState({
          wRatio:wRatio,
          hRatio:hRatio
        });        


      });



      /*
      EXIF.getData(img, () => {
        var allMetaData = EXIF.getAllTags(img);
        console.log(allMetaData);
        var lng = toDecimal(EXIF.getTag(img, 'GPSLongitude'));
        var lat = toDecimal(EXIF.getTag(img, 'GPSLatitude'));
        this.setState({
          lat:lat,
          lng:lng,
          allMetaData:JSON.stringify(allMetaData, null, 2)
        });
      });
      var toDecimal = function (number) {
        if (isNull(number)) return 0;
        return number[0].numerator + number[1].numerator /
            (60 * number[1].denominator) + number[2].numerator / (3600 * number[2].denominator);
      };*/
    };
     
  }  
  render() {
    const file = this.state.files[0];
    const files = this.state.files;
    const uploadError = this.state.uploadError;
    const isProcessing = this.state.isProcessing;
    const response = this.state.uploadResponse;
    const predictions = (response && response.probabilities) || [];

    return ( <
      div >
      <
      div className = "title" >
      <
      h1 className = "intro" >
      BAT Einstein Object Detection Demo <
      div className = "detail" > < /div> < /
      h1 > <
      /div> 
      
      <
      div className = {
        classNames(
          "app",
          file != null ? "app-with-image" : null)
      } > {
        response || isProcessing ? null : < Dropzone
        accept = {
          'image/png, image/jpeg'
        }
        multiple = {
          false
        }
        onDrop = {
          this.onDrop
        }
        style = {
          {}
        }
        className = {
          classNames(
            'dropzone', 'initial-dropzone',
            file != null ? 'dropzone-dropped' : null
          )
        }
        activeClassName = "dropzone-active"
        rejectClassName = "dropzone-reject" >
        <
        UploadTarget / >
        <
        /Dropzone>}


        <
        Dropzone
        accept = {
          'image/png, image/jpeg'
        }
        multiple = {
          false
        }
        onDrop = {
          this.onDrop
        }
        style = {
          {}
        }
        className = {
          classNames(
            'dropzone',
            file != null ? 'dropzone-dropped' : null
          )
        }
        activeClassName = "dropzone-active"
        rejectClassName = "dropzone-reject" >
        <
        div className = "result-wrapper" >

        <
        div className = {
          classNames(
            'image-preview',
            file != null ? 'image-preview-visible' : null)
        } >

        {
          isProcessing || response ? < img ref = "img"
          id = "my-image"
          alt = "Upload preview"
          src = {
            file && file.preview
          }
          style = {
            {
              display: 'block'
            }
          }
          /> : null} {!response || isProcessing ? null : <
          div className = "prompt" > Drop or tap to upload another. < /div>
        } <
        div className = "spinner-wrapper" > {
          isProcessing ?
          <
          span > < Spinner / > < div className = "spinner-text" > Analysing Image... < /div></span >
          :
            null
        } {
          uploadError
            ?
            uploadError :
            null
        } <
        /div> 
        
        <
        /div>
        
        <
        /
        div > 
        
        <
        /Dropzone>       

        <
        Predictions 
        action={this.handler}
        files = {files} contents = {
          predictions
        }
        /> <
        /div>
        <div className = "canvas">
        <
                canvas id="canvas" ref = "canvas" 
                width = "900px"
                height = "900px" / >
        </div>
        <LeafletMap 
          lat={this.state.lat} 
          lng={this.state.lng}
          zoom={this.state.zoom}
          allMetaData={this.state.allMetaData}
        />  

        <
        div className = "footer" >
        <
        a href = "https://github.com/heroku/einstein-vision-node" > GitHub < /a> <
        a href = "https://metamind.readme.io/" > API Docs < /a> < /
        div > <
        /div>
      );
    }

    handler = (x,y,mX,mY) => {   
      let context = this.refs.canvas.getContext('2d');
      let wRatio = this.state.wRatio;
      let hRatio = this.state.hRatio;
      let minX = x * wRatio;
      let minY = y * hRatio;
      let maxX = (mX - x) * wRatio;
      let maxY = (mY - y) * hRatio;    
      context.beginPath();
      context.rect(minX, minY, maxX, maxY);
      context.lineWidth = 2;  
      context.strokeStyle = 'red';
      context.stroke();       
    }
    onDrop = (acceptedFiles, rejectedFiles) => {
      if (acceptedFiles.length) {
        this.setState({
          isProcessing: true,
          files: acceptedFiles,
          uploadError: null,
          uploadResponse: null
        });

        var req = superagent.post('/file-upload');
        acceptedFiles.forEach((file) => {
          // Backend expects 'file' reference
          req.attach('file', file, file.name);
        });
        req.end((err, res) => {
          this.setState({
            isProcessing: false
          });
          if (err) {
            console.log('file-upload error', err);
            this.setState({
              uploadError: err.message
            });
            return;
          }
          console.log('file-upload response', res);

          this.setState({
            uploadResponse: JSON.parse(res.text)
          });
          this.updateCanvas();
        });
      }
    }
  }

  export default App;