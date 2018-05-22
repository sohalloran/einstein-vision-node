import React, { Component } from 'react';
import './predictions.css';
import { StaggeredMotion, spring } from 'react-motion';

class Predictions extends Component {
  static propTypes = {
    // The Predictive Vision Predictions
    contents: React.PropTypes.array.isRequired
  }
  onClick = (minX,minY,maxX,maxY) => {
    this.props.action(minX,minY,maxX,maxY);
  }
  render() {
    const contents = this.props.contents;
    if (contents == null || contents.length === 0) {
      return <div className="empty"/>;
    }
    
    let gMinX = 100000;
    let gMinY = 100000;
    let gMaxX = 0;
    let gMaxY = 0;   
    let boundedArea =  0;
    let totalArea = 0;
    let percentArea = 0;
    for(let i=0;i<contents.length;i++) {
      let box = contents[i].boundingBox;
      boundedArea += (box.maxX - box.minX) * (box.maxY - box.minY);
      gMinX = box.minX < gMinX ? box.minX : gMinX;
      gMinY = box.minY < gMinY ? box.minY : gMinY;
      gMaxX = box.minX > gMaxX ? box.maxX : gMaxX;
      gMaxY = box.minY > gMaxY ? box.maxY : gMaxY;
    }
    totalArea = (gMaxX - gMinX) * (gMaxY - gMinY);
    percentArea = Math.round(boundedArea / totalArea * 100);
    percentArea = percentArea>100 ? 100 : percentArea;
    return (<div><div>Estimated Percent of Display: {percentArea} %</div><StaggeredMotion
      defaultStyles={contents.map( p => ({maxHeight: 0}))}
      styles={prevInterpolatedStyles => 
        prevInterpolatedStyles.map((_, i) =>
          i === 0
            ? {maxHeight: spring(100)}
            : {maxHeight: spring(prevInterpolatedStyles[i - 1].maxHeight)}
        )
      }>
      {interpolatingStyles =>
        <div className="predictions">
          {interpolatingStyles.map((style, i) => {
            const prediction = contents[i];
            if (prediction == null) {
              return null;
            }
            const probability = prediction.probability;
            const percent = Math.round(probability * 100);
            const labels = prediction.label.split(/,\s*/);
            const boundingBox = prediction.boundingBox;
            const minX = boundingBox.minX;
            const minY = boundingBox.minY;
            const maxX = boundingBox.maxX;
            const maxY = boundingBox.maxY;
            let color = '#fff';
            if (probability < .5) color = '#777';
            return (<div 
              className='prediction'
              key={`prediction-${i}`}
              //onClick={this.props.action}
              onClick={this.onClick.bind(this, minX, minY, maxX, maxY)}
              style={Object.assign(style, {
                color: color,
                backgroundColor: `rgba(0,119,187,${probability})`
              })}>
              <h2>{labels[0]} <span className="probability" title="Probability">{percent}%</span></h2>
              {labels[1] != null
                ? <p className="alt-labels">{labels.slice(1, labels.length).join(', ')}</p>
                : null}
              
            </div>);
          })}
        </div>
      }
    </StaggeredMotion></div>
    
    );
  }
}

export default Predictions;