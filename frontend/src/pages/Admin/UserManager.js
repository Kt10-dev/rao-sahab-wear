// src/pages/Admin/UserManager.js

import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  IconButton,
  useToast,
  Badge,
  HStack,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Select,
  useDisclosure,
  Text,
  Flex,
  InputGroup,
  InputLeftElement,
  Tabs,
  TabList,
  Tab,
  Spacer,
  VStack,
  Divider,
  Stack,
  Avatar,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  FaTrash,
  FaEdit,
  FaUserShield,
  FaSearch,
  FaUser,
  FaUsers,
} from "react-icons/fa";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../components/Utility/Loader";
import EmptyState from "../../components/Utility/EmptyState";

const API_BASE_URL = "https://raosahab-api.onrender.com";

const UserManager = () => {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Data State
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0); // 0: All, 1: Admins, 2: Customers

  // Edit State
  const [selectedUser, setSelectedUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("user");
  const [updateLoading, setUpdateLoading] = useState(false);

  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // 🟢 1. Fetch Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const config = {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      };
      const { data } = await axios.get(`${API_BASE_URL}/api/users`, config);
      setUsers(data);
      setFilteredUsers(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch users");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🟢 2. Filter Logic
  useEffect(() => {
    let result = users;

    // Tab Filter
    if (activeTab === 1) result = result.filter((u) => u.role === "admin");
    if (activeTab === 2) result = result.filter((u) => u.role === "user");

    // Search Filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(lowerQuery) ||
          u.email.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredUsers(result);
  }, [searchQuery, activeTab, users]);

  // 🟢 3. Delete Handler
  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        };
        await axios.delete(`${API_BASE_URL}/api/users/${id}`, config);
        toast({ title: "User Deleted", status: "success", duration: 2000 });
        fetchUsers();
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          status: "error",
        });
      }
    }
  };

  // 🟢 4. Edit Modal Handlers
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    onOpen();
  };

  const updateHandler = async () => {
    setUpdateLoading(true);
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`,
        },
      };
      await axios.put(
        `${API_BASE_URL}/api/users/${selectedUser._id}`,
        {
          name: editName,
          email: editEmail,
          role: editRole,
        },
        config
      );

      toast({ title: "User Updated", status: "success", duration: 2000 });
      onClose();
      fetchUsers();
    } catch (error) {
      toast({ title: "Update Failed", status: "error" });
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) return <Loader message="Loading Users..." />;
  if (error)
    return <EmptyState title="Error" description={error} iconName="user" />;

  // Helper for Role Badge
  const getRoleBadge = (role) => {
    return role === "admin" ? (
      <Badge colorScheme="purple" variant="solid" borderRadius="full" px={2}>
        ADMIN
      </Badge>
    ) : (
      <Badge colorScheme="gray" variant="subtle" borderRadius="full" px={2}>
        USER
      </Badge>
    );
  };

  return (
    <Box>
      <Heading size="xl" mb={6}>
        User Management
      </Heading>

      {/* 🟢 TOP BAR: Search */}
      <Flex gap={6} mb={8} wrap="wrap">
        <InputGroup
          w={{ base: "100%", md: "400px" }}
          bg="white"
          borderRadius="md"
        >
          <InputLeftElement pointerEvents="none">
            <FaSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search by Name or Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
        <Spacer />
      </Flex>

      {/* 🟢 TABS */}
      <Tabs
        variant="soft-rounded"
        colorScheme="cyan"
        onChange={(index) => setActiveTab(index)}
        mb={6}
      >
        <TabList
          overflowX="auto"
          overflowY="hidden"
          whiteSpace="nowrap"
          pb={2}
          css={{ "&::-webkit-scrollbar": { display: "none" } }}
        >
          <Tab>
            <HStack>
              <FaUsers />
              <Text>All ({users.length})</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <FaUserShield />
              <Text>Admins</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <FaUser />
              <Text>Customers</Text>
            </HStack>
          </Tab>
        </TabList>
      </Tabs>

      {/* 🟢 DESKTOP TABLE VIEW */}
      <Box
        bg="white"
        borderRadius="xl"
        boxShadow="sm"
        overflow="hidden"
        border="1px solid"
        borderColor="gray.100"
        display={{ base: "none", md: "block" }}
      >
        <TableContainer>
          <Table variant="simple">
            <Thead bg="gray.50">
              <Tr>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Joined Date</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredUsers.length === 0 ? (
                <Tr>
                  <Td colSpan={4} textAlign="center" py={10} color="gray.500">
                    No users found.
                  </Td>
                </Tr>
              ) : (
                filteredUsers.map((user) => (
                  <Tr key={user._id} _hover={{ bg: "gray.50" }}>
                    <Td>
                      <HStack spacing={3}>
                        <Avatar size="sm" name={user.name} />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="bold" fontSize="sm">
                            {user.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {user.email}
                          </Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>{getRoleBadge(user.role)}</Td>
                    <Td fontSize="sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Tooltip label="Edit User">
                          <IconButton
                            size="sm"
                            icon={<FaEdit />}
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => openEditModal(user)}
                          />
                        </Tooltip>
                        <Tooltip label="Delete User">
                          <IconButton
                            size="sm"
                            icon={<FaTrash />}
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => deleteHandler(user._id)}
                            isDisabled={user._id === currentUser._id} // Self delete rokne ke liye
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>

      {/* 🟢 MOBILE CARD VIEW */}
      <VStack
        display={{ base: "flex", md: "none" }}
        align="stretch"
        spacing={4}
      >
        {filteredUsers.length === 0 ? (
          <Text textAlign="center" color="gray.500">
            No users found.
          </Text>
        ) : (
          filteredUsers.map((user) => (
            <Box
              key={user._id}
              p={5}
              bg="white"
              borderRadius="lg"
              borderWidth="1px"
              boxShadow="sm"
            >
              <Flex justify="space-between" align="start" mb={3}>
                <HStack spacing={3}>
                  <Avatar size="md" name={user.name} />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold">{user.name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {user.email}
                    </Text>
                  </VStack>
                </HStack>
                {getRoleBadge(user.role)}
              </Flex>

              <Divider mb={3} />

              <HStack justify="space-between" align="center">
                <Text fontSize="xs" color="gray.400">
                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                </Text>
                <HStack>
                  <Button
                    size="sm"
                    leftIcon={<FaEdit />}
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => openEditModal(user)}
                  >
                    Edit
                  </Button>
                  <IconButton
                    size="sm"
                    icon={<FaTrash />}
                    colorScheme="red"
                    onClick={() => deleteHandler(user._id)}
                    isDisabled={user._id === currentUser._id}
                  />
                </HStack>
              </HStack>
            </Box>
          ))
        )}
      </VStack>

      {/* Edit User Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Role</FormLabel>
                <Select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={updateHandler}
              isLoading={updateLoading}
            >
              Update User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UserManager;
