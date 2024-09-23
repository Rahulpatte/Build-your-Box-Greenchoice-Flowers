import React, { useEffect, useState } from 'react';
import { IndexTable, Card, Page, Button, Thumbnail, Text, Modal, FormLayout, TextField, InlineStack, ButtonGroup } from '@shopify/polaris';
import { useNavigate, useParams } from '@remix-run/react';
// import Bundle from './Bundle';

export default function CollectionsTable({ productId }) {
    const [bundles, setBundles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateBundle, setShowCreateBundle] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingBundle, setEditingBundle] = useState(null);
    const [title, setTitle] = useState('');
    const [bunches, setBunches] = useState('');
    const [image, setImage] = useState('');
    const navigate = useNavigate()
    const handleCreateBundle = () => setShowCreateBundle(true);

    const handleEditBundle = (bundle) => {
        // setEditingBundle(bundle);
        // setTitle(bundle.title);
        // setBunches(bundle.bunches.join(', '));
        // setImage(bundle.image);
        // setShowEditModal(true);
        console.log("INSIDE_BUNDLE_PRODUCT", bundle)
        return navigate(`/app/collection/create/${bundle._id}`)
    };

    const handleDeleteBundle = async (bundleId) => {
        if (window.confirm('Are you sure you want to delete this bundle?')) {
            try {
                const response = await fetch('/api/bundles/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: bundleId }),
                });

                if (response.ok) {
                    setBundles(bundles.filter((bundle) => bundle._id !== bundleId));
                } else {
                    const error = await response.json();
                    console.error('Failed to delete bundle:', error.error);
                }
            } catch (error) {
                console.error('Failed to delete bundle:', error);
            }
        }
    };


    useEffect(() => {
        const fetchBundles = async () => {
            try {
                const response = await fetch(`/api/bundles`);
                const data = await response.json();
                setBundles(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch bundles:', error);
                setLoading(false);
            }
        };

        fetchBundles();
    }, [productId]);

    const resourceName = {
        singular: 'bundle',
        plural: 'bundles',
    };

    const rowMarkup = bundles.map((bundle, index) => (
        <IndexTable.Row
            id={bundle._id}
            key={bundle._id}
            position={index}
        >
            <IndexTable.Cell>
                <Thumbnail source={bundle.image} alt={bundle.title} />
            </IndexTable.Cell>
            <IndexTable.Cell>{bundle.title}</IndexTable.Cell>
            <IndexTable.Cell>{bundle.bunches.join(', ')}</IndexTable.Cell>
            <IndexTable.Cell>{bundle.products.length}</IndexTable.Cell>
            <IndexTable.Cell>{new Date(bundle.createdAt).toLocaleString()}</IndexTable.Cell>
            <IndexTable.Cell>
                <Button onClick={() => handleEditBundle(bundle)}>Edit</Button>
                <Button destructive onClick={() => handleDeleteBundle(bundle._id)}>Delete</Button>
            </IndexTable.Cell>
        </IndexTable.Row>
    ));

    return (
        <Page title="All Collections">
            <Card>
                <IndexTable
                    resourceName={resourceName}
                    itemCount={bundles.length}
                    loading={loading}
                    headings={[
                        { title: 'Image' },
                        { title: 'Title' },
                        { title: 'Bunches' },
                        { title: 'Products' },
                        { title: 'Created At' },
                        { title: 'Actions' },
                    ]}
                >
                    {rowMarkup}
                </IndexTable>
                <InlineStack align="end">
                    <ButtonGroup>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/app/collection/create')}
                            accessibilityLabel="Add tracking number"
                        >
                            Create a Collection
                        </Button>
                    </ButtonGroup>
                </InlineStack>
            </Card>
        </Page>
    );
}
