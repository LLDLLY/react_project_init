import React from 'react';

/**
 * Loading
 */
export default class Loading extends React.Component {

    render() {
        return (
            <div className="loading">
                <div className="mask"/>
                <div className="load">
                    <div className="dot white"/>
                    <div className="dot"/>
                    <div className="dot"/>
                    <div className="dot"/>
                    <div className="dot"/>
                </div>
            </div>
        );
    }
}