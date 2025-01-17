import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

import {I18N, i18n} from '../../utils/i18n';

import ContentWrapper, {Content} from './Content';
import AsideNavigation from '../AsideNavigation/AsideNavigation';

import {getUser} from '../../store/reducers/authentication';
import {registerLanguages} from '../../utils/monaco';

import './App.scss';

registerLanguages();

class App extends React.Component {
    static propTypes = {
        isAuthenticated: PropTypes.bool,
        children: PropTypes.node,
    };

    constructor(props) {
        super(props);
        i18n.setLang(I18N.LANGS.en);
    }

    componentDidMount() {
        const {isAuthenticated, getUser} = this.props;
        if (isAuthenticated) {
            getUser();
        }
    }

    componentDidUpdate(prevProps) {
        const {isAuthenticated, getUser, internalUser} = this.props;
        if (isAuthenticated && (!prevProps.isAuthenticated || !internalUser)) {
            getUser();
        }
    }

    renderContentWithNavigation() {
        return (
            <AsideNavigation>
                <Content singleClusterMode={this.props.singleClusterMode} />
                <div id="fullscreen-root"></div>
            </AsideNavigation>
        );
    }

    render() {
        return <ContentWrapper>{this.renderContentWithNavigation()}</ContentWrapper>;
    }
}

function mapStateToProps(state) {
    return {
        isAuthenticated: state.authentication.isAuthenticated,
        internalUser: state.authentication.user,
        singleClusterMode: state.singleClusterMode,
    };
}

const mapDispatchToProps = {
    getUser,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
