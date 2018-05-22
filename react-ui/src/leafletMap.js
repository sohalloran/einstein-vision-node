import React, { Component } from 'react'
import { Map, Marker, Popup, TileLayer } from 'react-leaflet'
import './leafletMap.css';

export default class LeafletMap extends Component {
  state = {
    allMetaData: '',
    lat: 51.505,
    lng: -0.09,
    zoom: 13,
  }
  componentWillReceiveProps(props) {
    this.setState({
      lat: props.lat,
      lng: props.lng,
      zoom: props.zoom,
      allMetaData: props.allMetaData,      
    });
  }
  render() {
    const position = [this.state.lat, this.state.lng]
    return (
      <Map center={position} zoom={this.state.zoom} className="leaflet">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <span>
              {this.state.allMetaData}
            </span>
          </Popup>
        </Marker>
      </Map>
    )
  }
}