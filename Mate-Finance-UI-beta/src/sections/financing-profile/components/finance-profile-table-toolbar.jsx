import PropTypes from 'prop-types';
import { useCallback } from 'react';
// @mui
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
// components
import Iconify from 'src/components/iconify';
// locales
// ----------------------------------------------------------------------

export default function FinanceTableToolbar({ filters, onFilters, search }) {
  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleEnterKeyPress = (event) => {
    if (event.key === 'Enter') {
      search();
    }
  };
  return (
    <div>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={filters.name}
            onChange={handleFilterName}
            onKeyPress={handleEnterKeyPress}
            placeholder="Search"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
           
          />
        </Stack>
      </Stack>
    </div>
  );
}

FinanceTableToolbar.propTypes = {
  filters: PropTypes.object,
  onFilters: PropTypes.func,
  search: PropTypes.func,
};
