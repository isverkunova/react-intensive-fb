// Core
import React, { Component } from 'react';
import moment from 'moment';
import { func, string, number, array } from 'prop-types';

// Components
import { Consumer } from 'components/HOC/withProfile';
import Like from 'components/Like';

// Instruments
import Styles from './styles.m.css';

export default class Post extends Component {
    static propTypes = {
        _likePost:   func.isRequired,
        _removePost: func.isRequired,
        comment:     string.isRequired,
        created:     number.isRequired,
        id:          string.isRequired,
        likes:       array.isRequired,
    };

    constructor () {
        super();

        this.removePost = this._removePost.bind(this);
    }

    _removePost () {
        const { id, _removePost } = this.props;

        _removePost(id);
    }

    render () {
        const { comment, created, _likePost, likes, id } = this.props;

        return (
            <Consumer>
                {(context) => (
                    <section className = { Styles.post }>
                        <span className = { Styles.cross } onClick = { this.removePost } />
                        <img src = { context.avatar } />
                        <a>{`${context.currentUserFirstName} ${context.currentUserLastName}`}</a>
                        <time>{moment.unix(created).format('MMMM D h:mm:ss a')}</time>
                        <p>{comment}</p>
                        <Like
                            _likePost = { _likePost }
                            id = { id }
                            likes = { likes }
                            { ...context }
                        />
                    </section>
                )}
            </Consumer>
        );
    }
}
