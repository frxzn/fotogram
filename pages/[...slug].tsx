import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import Spinner from 'react-spinner-material';
import { useMediaQuery } from 'react-responsive';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../store';
import { initialize, reset as resetApi } from '../slices/apiSlice';
import { reset as resetUI, setUsername } from '../slices/UserInterfaceSlice';
import Layout from '../components/Layout';
import Navbar from '../components/Navbar';
import Profile from '../components/Profile';
import DisplayGrid from '../components/Grid/DisplayGrid';
import DisplayModal from '../components/Modal/DisplayModal';

const Center = styled.div`
  max-width: ${(props) => props.theme.dimensions.maxWidth};
  margin: 54px auto 0 auto;
  padding: 0 20px;

  @media (max-width: 735px) {
    padding: 0;
    margin: 54px auto 3px auto;
  }
`;

const Error = styled.div`
  text-align: center;
  font-size: 1.2rem;
  font-weight: 300;
  padding: 3rem 0;
  margin: 0 1rem;
`;

const UserProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { slug } = router.query;
  const isMobile = useMediaQuery({ query: `(max-width: 735px)` });

  const username = useSelector(
    (state: RootState) => state.userInterface.username
  );
  const downloadMode = useSelector(
    (state: RootState) => state.userInterface.downloadMode
  );
  const loading = useSelector((state: RootState) => state.api.loading);
  const error = useSelector((state: RootState) => state.api.error);
  const user = useSelector((state: RootState) => state.api.user);

  useEffect(() => {
    const HtmlCenter = document.getElementById('username-center');
    if (HtmlCenter) {
      if (isMobile) {
        if (downloadMode) {
          HtmlCenter.style.marginBottom = '57px';
        } else {
          HtmlCenter.style.marginBottom = '3px';
        }
      } else {
        if (downloadMode) {
          HtmlCenter.style.marginBottom = '54px';
        } else {
          HtmlCenter.style.marginBottom = '0';
        }
      }
    }
  }, [downloadMode]);

  useEffect(() => {
    return () => {
      dispatch(setUsername(''));
    };
  }, []);

  useEffect(() => {
    if (slug) {
      dispatch(setUsername(slug[0]));
    }
  }, [slug]);

  useEffect(() => {
    if (username) {
      dispatch(resetUI());
      dispatch(resetApi());
      const promise = dispatch(initialize(username));
      return () => {
        promise.abort();
      };
    }
  }, [username]);

  let main;
  if (error) {
    main = <Error>{error}</Error>;
  } else if (user?.is_private) {
    main = <Error>Esta cuenta es privada</Error>;
  } else {
    main = <DisplayGrid />;
  }

  let render;
  if (loading) {
    render = (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '3rem 0',
          marginTop: 54,
        }}
      >
        <Spinner radius={64} color={'#ff0078'} stroke={6} visible={true} />
      </div>
    );
  } else {
    render = (
      <Center id="username-center">
        {!error && <Profile user={user} />}
        {main}
        {!!router.query.shortcode && <DisplayModal />}
      </Center>
    );
  }

  return (
    <Layout
      title={`${
        user?.full_name ? user?.full_name + ' | Fotogram' : 'Fotogram'
      } `}
    >
      <Navbar />
      {render}
    </Layout>
  );
};

export default UserProfile;
