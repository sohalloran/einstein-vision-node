import React, {
  Component
} from 'react';
import Dropzone from 'react-dropzone';
import classNames from 'classnames';
import superagent from 'superagent';

import './app.css';
import Spinner from './spinner';
import Predictions from './predictions';
import UploadTarget from './upload-target';

class App extends Component {
  
  state = {
    files: [],
    isProcessing: false,
    uploadError: null,
    uploadResponse: null,
    wRatio: 0,
    hRatio: 0
  }
  updateCanvas() {
    const response = this.state.uploadResponse;
    const predictions = response.probabilities;

    let img = new Image();
    const file = this.state.files[0];
    const context = this.refs.canvas.getContext('2d');
    let height = 900;
    let width = 900;
    
    img.onload = () => {
      context.drawImage(img, 0, 0, img.width, img.height, 0, 0, 900, 900);
      let wRatio = 900 / img.width;
      let hRatio = 900 / img.height;
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
    };
    img.src = file && file.preview;  
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
      /div> <
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
        /div> <
        canvas id="canvas" ref = "canvas"
        width = "900px"
        height = "900px" / >
        <
        /div>

        <
        /
        div > <
        /Dropzone>

        <
        Predictions 
        action={this.handler}
        files = {files} contents = {
          predictions
        }
        /> <
        /div>

        <
        div className = "footer" >
        <
        a href = "https://github.com/heroku/einstein-vision-node" > GitHub < /a> <
        a href = "https://metamind.readme.io/v1/docs" > API Docs < /a> < /
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