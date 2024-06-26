import { useState, useEffect } from 'react';
import axios from 'axios'

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import TableNoData from 'src/sections/table-no-data';
import TableHead from 'src/sections/table-head';
import TableEmptyRows from 'src/sections/table-empty-rows';
import TableToolbar from 'src/sections/table-toolbar';
import { emptyRows, applyFilter, getComparator } from 'src/sections/utils';
import StorageTableRow from '../storage-table-row'; 
import NewEquipmentForm from '../new-equipment-form';

export default function StoragePage() {
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [storages, setStorages] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchStorages = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/equipments/');
      // Check if the response status is not in the range of 200-299 (indicating success)
      if (response.status < 200 || response.status >= 300) {
        throw new Error('Failed to fetch data');
      }
      // Access the data directly from the response
      const data = response.data;
      // Map the fetched data to match the expected structure
      const mappedData = data.map(storage => ({
        id: storage.id,
        name: storage.equipment_type.name, // Use equipment type name for value name
        avatar: storage.equipment_type.equipment_image, // Use equipment_image for the avatar
        renter: storage.user ? storage.user.name : 'Available', // Check if user exists, use name, else 'Available'
        state: storage.state
      }));
      // Set the mapped data to the state
      setStorages(mappedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchStorages();
  }, []);

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = storages.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleDeleteRow = (id) => {
    // Filter out the deleted row from the storage list
    const updatedStorages = storages.filter(storage => storage.id !== id);
    setStorages(updatedStorages);
    // Clear the selected state if the deleted item was selected
    if (selected.includes(id)) {
      setSelected(selected.filter(item => item !== id));
    }
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    fetchStorages(); // Refresh the storage list after a new equipment is added
  };

  const dataFiltered = applyFilter({
    inputData: storages,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Storages</Typography>
        <Button variant="contained" color="inherit" startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleOpenForm}>
          New Equipment
        </Button>
      </Stack>

      <Card>
        <TableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <TableHead
                order={order}
                orderBy={orderBy}
                rowCount={storages.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: 'id', label: 'Id' },
                  { id: 'name', label: 'Name' },
                  { id: 'renter', label: 'Renter' },
                  { id: 'state', label: 'State' },
                  { id: '' },
                ]}
              />
              <TableBody>
                {dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <StorageTableRow
                      key={row.id}
                      id={row.id}
                      name={row.name}
                      equipment_imageUrl={row.avatar}
                      renter={row.renter}
                      state={row.state}
                      selected={selected.indexOf(row.name) !== -1}
                      handleClick={(event) => handleClick(event, row.name)}
                      onDeleteRow={handleDeleteRow}
                    />
                  ))}

                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, storages.length)}
                />

                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          page={page}
          component="div"
          count={storages.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 25]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <NewEquipmentForm open={isFormOpen} onClose={handleCloseForm} onSubmit={handleCloseForm} />
    </Container>
  );
}
