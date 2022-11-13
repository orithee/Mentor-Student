import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import SimpleBackdrop from './SimpleBackdrop';
import { signInForm } from '../helpers/types';
import { useDispatch } from 'react-redux';
import { updateUserLogged } from '../redux/globalSlice';

const theme = createTheme();

export default function SignIn() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState<Boolean>(false);
  const [backdrop, setBackdrop] = useState<Boolean>(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setBackdrop(true);
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const formData = { name: form.get('name'), password: form.get('password') };
    checkSignIn(formData);
  };

  const checkSignIn = async (formData: signInForm) => {
    console.log(uuid);
    try {
      const res = await axios.post('/signIn', formData);
      if (res.data) {
        if (res.data.success) {
          dispatch(
            updateUserLogged({
              isStudent: res.data.student,
              name: formData.name,
            })
          );
          navigate('/Dashboard');
        } else setError(true);
        setBackdrop(false);
      }
    } catch (error) {
      console.log(error);
      setBackdrop(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              label="Name"
              name="name"
              autoComplete="name"
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              autoComplete="current-password"
            />
            {error && (
              <Alert severity="error">
                <AlertTitle>
                  <strong>wrong user / password... try again</strong>
                </AlertTitle>
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
          </Box>
        </Box>
        {backdrop && <SimpleBackdrop />}
      </Container>
    </ThemeProvider>
  );
}
