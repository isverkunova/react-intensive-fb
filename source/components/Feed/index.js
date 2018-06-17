// Core
import React, { Component } from 'react';
import { Transition, CSSTransition, TransitionGroup } from 'react-transition-group';
import { fromTo } from 'gsap';

// Components
import { withProfile } from 'components/HOC/withProfile';
import Catcher from 'components/Catcher';
import StatusBar from 'components/StatusBar';
import Composer from 'components/Composer';
import Post from 'components/Post';
import Spinner from 'components/Spinner';
import Postman from 'components/Postman';
import Counter from 'components/Counter';

// Instruments
import Styles from './styles.m.css';
import { api, TOKEN, GROUP_ID } from 'config/api';
import { socket } from 'socket/init';

@withProfile
export default class Feed extends Component {
    state = {
        posts:    [],
        spinning: false,
        postman:  true,
    };

    componentDidMount () {
        const { currentUserFirstName, currentUserLastName } = this.props;

        this._fetchPosts();

        socket.emit('join', GROUP_ID);

        socket.on('create', (postJSON) => {
            const { data: createdPost, meta } = JSON.parse(postJSON);

            if (
                `${currentUserFirstName} ${currentUserLastName}` !==
                `${meta.authorFirstName} ${meta.authorLastName}`
            ) {
                this.setState(({ posts }) => ({
                    posts: [createdPost, ...posts],
                }));
            }
        });

        socket.on('remove', (postJSON) => {
            const { data: removedPost, meta } = JSON.parse(postJSON);

            if (
                `${currentUserFirstName} ${currentUserLastName}` !==
                `${meta.authorFirstName} ${meta.authorLastName}`
            ) {
                this.setState(({ posts }) => ({
                    posts: posts.filter((post) => post.id !== removedPost.id),
                }));
            }
        });

        socket.on('like', (postJSON) => {
            const { data: likedPost, meta } = JSON.parse(postJSON);

            if (
                `${currentUserFirstName} ${currentUserLastName}` !==
                `${meta.authorFirstName} ${meta.authorLastName}`
            ) {
                this.setState(({ posts }) => ({
                    posts: posts.map(
                        (post) => post.id === likedPost.id ? likedPost : post,
                    ),
                }));
            }
        });
    }

    componentWillUnmount () {
        socket.removeListener('create');
        socket.removeListener('remove');
        socket.removeListener('like');
    }

    _removePost = async (id) => {
        this._setSpinningState(true);

        await fetch(`${api}/${id}`, {
            method:  'DELETE',
            headers: {
                Authorization: TOKEN,
            },
        });

        this.setState(({ posts }) => ({
            posts:    posts.filter((post) => post.id !== id),
            spinning: false,
        }));
    }

    _setSpinningState = (state) => {
        this.setState({
            spinning: state,
        });
    }

    _fetchPosts = async () => {
        this._setSpinningState(true);

        const response = await fetch(api, {
            method: 'GET',
        });

        const { data: posts } = await response.json();

        this.setState({
            posts,
            spinning: false,
        });
    }

    _createPost = async (comment) => {
        this._setSpinningState(true);

        const response = await fetch(api, {
            method:  'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization:  TOKEN,
            },
            body: JSON.stringify({ comment }),
        });

        const { data: post } = await response.json();

        this.setState(({ posts }) => ({
            posts:    [post, ...posts],
            spinning: false,
        }));
    }

    _likePost = async (id) => {
        this._setSpinningState(true);

        const response = await fetch(`${api}/${id}`, {
            method:  'PUT',
            headers: {
                Authorization: TOKEN,
            },
        });

        const { data: likedPost } = await response.json();

        this.setState(({ posts }) => ({
            posts: posts.map(
                (post) => post.id === likedPost.id ? likedPost : post,
            ),
            spinning: false,
        }));
    }

    _animateComposerEnter = (composer) => {
        fromTo(
            composer,
            1,
            { opacity: 0, rotationX: 50 },
            { opacity: 1, rotationX: 0 },
        );
    };

    _animatePostmanEnter = (postman) => {
        fromTo(postman, 1, { x: 500 }, { x: 0 });
    };

    _animatePostmanExit = (postman) => {
        fromTo(postman, 1, { x: 0 }, { x: 500 });
    };

    render () {
        const { posts, postman, spinning } = this.state;

        const postsJSX = posts.map((post) => {
            return (
                <CSSTransition
                    classNames = { {
                        enter:       Styles.postInStart,
                        enterActive: Styles.postInEnd,
                        exit:        Styles.postOutStart,
                        exitActive:  Styles.postOutEnd,
                    } }
                    key = { post.id }
                    timeout = { {
                        enter: 500,
                        exit:  400,
                    } }>
                    <Catcher>
                        <Post
                            { ...post }
                            _likePost = { this._likePost }
                            _removePost = { this._removePost }
                        />
                    </Catcher>
                </CSSTransition>
            );
        });

        return (
            <section className = { Styles.feed }>
                <Spinner isSpinning = { spinning } />
                <StatusBar />
                <Transition
                    appear
                    in
                    timeout = { 1000 }
                    onEnter = { this._animateComposerEnter }>
                    <Composer _createPost = { this._createPost } />
                </Transition>
                <Counter count = { postsJSX.length } />
                <Transition
                    appear
                    in = { postman }
                    timeout = { 4000 }
                    onEnter = { this._animatePostmanEnter }
                    onEntered = { this._animatePostmanExit }>
                    <Postman />
                </Transition>
                <TransitionGroup>{postsJSX}</TransitionGroup>
            </section>
        );
    }
}
