import { Box, Container, Grid, Toolbar } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Cards } from '../helpers/types';
import { globalState } from '../redux/store';
import CodeCard from './CodeCard';
import OpenBlockCode from './utilities/OpenBlockCode';
import BasicModal from './utilities/BasicModal';
import CurrentSession from './CurrentSession';

// A component that displays exercise cards:
export default function CardsContainer() {
  const [cards, setCards] = useState<Cards[]>();
  const [openSession, setOpenSession] = useState<boolean | number>(false);
  const codeOpen = useSelector((state: globalState) => state.global.codeOpen);
  const links = useSelector((state: globalState) => state.global.sessionLinks);

  useEffect(() => {
    fetchCodeCards();
  }, []);

  const fetchCodeCards = async () => {
    const res = await axios.get('/code-cards');
    if (res.data) {
      setCards(res.data.cards);
    }
  };

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          {!codeOpen ? (
            <Grid container spacing={5}>
              {cards &&
                cards.map((card, index) => {
                  return (
                    <CodeCard
                      key={index}
                      title={card.title}
                      description={card.description}
                      blockId={card.id}
                      setOpenSession={setOpenSession}
                    />
                  );
                })}
            </Grid>
          ) : (
            <OpenBlockCode />
          )}
          {typeof openSession === 'number' && (
            <BasicModal
              setOpenSession={setOpenSession}
              sessionId={openSession}
            />
          )}
          {links.mentor && links.student && <CurrentSession />}
        </Container>
      </Box>
    </>
  );
}
