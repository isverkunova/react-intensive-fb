// Core
import React, { Component } from 'react';
import { createPortal } from 'react-dom';

// Instruments
import Styles from './styles.m.css';

const portal = document.getElementById('spinner');

export default class Spinner extends Component {
    render () {
        const spinning = this.props;

        return createPortal(
            spinning ? <div className = { Styles.spinner } /> : null,
            portal);
    }
}
