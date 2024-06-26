import { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios'; // Import axios for making HTTP requests

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { bgGradient } from 'src/theme/css';

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';

// Import the NewUserForm component
import NewUserForm from '../new-user-form';

export default function LoginView({ setIsAuthenticated, setIsStaff, setIsAdmin }) {
  const theme = useTheme();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNewUserForm, setShowNewUserForm] = useState(false); // State variable to track whether to show the new user form

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:3001/api/login', { username, password });
      // Store the token in localStorage or context
      localStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);

      // Parse the token to extract user information
      const token = localStorage.getItem('token');
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const { staff, admin } = decodedToken;

      // Set isStaff and isAdmin based on token values
      setIsStaff(staff);
      setIsAdmin(admin);
      
      router.push('/');
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const handleShowNewUserForm = () => {
    setShowNewUserForm(true);
  };

  const handleCloseNewUserForm = () => {
    setShowNewUserForm(false);
  };

  const handleNewUserSubmit = (formData) => {
    // Handle submitting the new user data
    console.log(formData);
  };

  
  const renderForm = (
    <>
      <Stack spacing={3}>
        <TextField
          name="username"
          label="UserName"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <TextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ my: 3 }}>
        <Link variant="subtitle2" underline="hover">
          Forgot password?
        </Link>
      </Stack>

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        loading={loading}
        onClick={handleLogin}
      >
        Login
      </LoadingButton>
    </>
  );


  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: '/assets/background/overlay_4.jpg',
        }),
        height: 1,
      }}
    >
      <Logo
        sx={{
          position: 'fixed',
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
        }}
      />

      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 420,
          }}
        >
          <Typography variant="h4">Sign in to ArcheryWolf</Typography>

          <Typography variant="body2" sx={{ mt: 2, mb: 5 }}>
            Don’t have an account?
            <Link variant="subtitle2" sx={{ ml: 0.5 }} onClick={handleShowNewUserForm}>
              Get started
            </Link>
          </Typography>

          {renderForm}
        </Card>
      </Stack>
      <NewUserForm
        open={showNewUserForm}
        onClose={handleCloseNewUserForm}
        onSubmit={handleNewUserSubmit}
      />
    </Box>
  );
}

LoginView.propTypes = {
  setIsAuthenticated: PropTypes.func.isRequired,
  setIsStaff: PropTypes.func.isRequired,
  setIsAdmin: PropTypes.func.isRequired,
};
