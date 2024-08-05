'use client'
import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField, MenuItem, Select, InputLabel, FormControl } from '@mui/material'
import { firestore} from './firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
  where
} from 'firebase/firestore'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {

const [inventory, setInventory] = useState([]) //store inventory to display
const [open, setOpen] = useState(false) //menu status
const [itemName, setItemName] = useState('') //
const handleOpen = () => setOpen(true) //open menu
const handleClose = () => setOpen(false) //close menu

const [field, setField] = useState('');
const [value, setValue] = useState('');

const handleSearch = async () => {
  if (field && value) await queryItem(field, value);
  else alert('Please enter both field and value.');
}

const updateInventory = async () => {
  const snapshot = collection(firestore, 'inventory') //access firestore inventory collection location
  const docs = await getDocs(snapshot) //array of things in collection 
  const inventoryList = []
  //adds each item 
  docs.forEach((doc) => {
    inventoryList.push({ name: doc.id, ...doc.data() })
  })
  setInventory(inventoryList) //inventory state updated
}

useEffect(() => {
  updateInventory()
}, [])

// collection => location
// doc => actual item
const addItem = async (item) => {
  const docRef = doc(collection(firestore, 'inventory'), item) //item location 
  const docSnap = await getDoc(docRef) //data response 
  if (docSnap.exists()) {
    const { quantity } = docSnap.data() //pulls quantity field from item
    await setDoc(docRef, { quantity: quantity + 1 }, { merge: true }) //update item quantity
  } 
  else await setDoc(docRef, { quantity: 1, name:item }) //create new item 
 
  await updateInventory()
}

const queryItem = async (field, value) => {
  try {
    let q;
    if (field==="quantity") q = query(collection(firestore, 'inventory'), where(field, '==', parseInt(value)));
    else q = query(collection(firestore, 'inventory'), where(field, '==', value))
    
    const querySnapshot = await getDocs(q); // Data response
    if (!querySnapshot.empty) {
      // If items are found, create a list of them
      const queriedItems = [];
      querySnapshot.forEach((docSnapshot) => {
        queriedItems.push({ name: docSnapshot.id, ...docSnapshot.data() });
      });
      setInventory(queriedItems);
    } else {
      console.log('No items found with the given criteria.');
      setInventory([]); // Clear the list if no items match the query
    }
  } catch (error) {
    console.error("Error querying item: ", error);
  }
}
const resetForm = () => {
  setField('name');
  setValue('');
  updateInventory(); // Fetch and display the full inventory
};

const removeItem = async (item) => {
  const docRef = doc(collection(firestore, 'inventory'), item)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    const { quantity } = docSnap.data()
    if (quantity === 1) {
      await deleteDoc(docRef)
    } else {
      await setDoc(docRef, { quantity: quantity - 1 })
    }
  }
  await updateInventory()
}


return (
  <Box
    width="100vw"
    height="100vh"
    display={'flex'}
    justifyContent={'center'}
    flexDirection={'column'}
    alignItems={'center'}
    gap={2}
  >
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Add Item
        </Typography>
        <Stack width="100%" direction={'row'} spacing={2}>
          <TextField
            id="outlined-basic"
            label="Item"
            variant="outlined"
            fullWidth
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <Button
            variant="outlined"
            onClick={() => {
              addItem(itemName)
              setItemName('')
              handleClose()
            }}
          >
            Add
          </Button>
        </Stack>
      </Box>
    </Modal>
    <Button variant="contained" onClick={handleOpen}>
      Add New Item
    </Button>
    {/* Search */}
    <div>
      <form onSubmit={(e) => e.preventDefault()}>
      <FormControl variant="outlined" style={{ marginRight: 10, minWidth: 120 }}>
  <InputLabel id="field-label">Field</InputLabel>
  <Select
    labelId="field-label"
    value={field}
    onChange={(e) => setField(e.target.value)}
    label="Field"
    style={{ backgroundColor: "white" }}
  >
    <MenuItem value="name">Name</MenuItem>
    <MenuItem value="quantity">Quantity</MenuItem>
  </Select>
</FormControl>

        <TextField
          label="Value"
          variant="outlined"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{ marginRight: 10, backgroundColor: "white"}}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search Item
        </Button>
        <Button variant="contained" onClick={resetForm} style={{ marginLeft: 10}}>
          Reset
        </Button>
      </form>
    </div>
    <Box border={'1px solid #333'}>
      <Box
        width="800px"
        height="100px"
        bgcolor={'#ADD8E6'}
        display={'flex'}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
          Inventory Items
        </Typography>
      </Box>
      {/* Inventory */}
      <Stack width="800px" height="300px" spacing={2} overflow={'auto'}>
        {inventory.map(({name, quantity}) => (
          <Box
            key={name}
            width="100%"
            minHeight="150px"
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
            bgcolor={'#f0f0f0'}
            paddingX={5}
          >
            <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Typography>
            <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
              Quantity: {quantity}
            </Typography>
            <Button variant="contained" onClick={() => removeItem(name)}>
              Remove
            </Button>
          </Box>
        ))}
      </Stack>
    </Box>
  </Box>
)
}