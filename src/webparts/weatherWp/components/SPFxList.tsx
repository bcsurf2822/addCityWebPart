import * as React from "react";
import { useEffect, useState } from "react";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { getSP } from "../pnpConfig";
import { IAddedLocation } from "./IMapState";
import styles from "./SPFxList.module.scss";

interface ListItem {
  Id: number;
  Title: string;
  State: string;
  City: string;
}

interface SPFxListProps {
  listName: string;
  locationToAdd: IAddedLocation | undefined;
  onAddedLocation: () => void;
  onCityAddedSuccessfully: () => void;
}

const SPFxList: React.FC<SPFxListProps> = ({
  listName,
  locationToAdd,
  onAddedLocation,
  onCityAddedSuccessfully,
}) => {
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sp = getSP();

  const fetchListItems = async (): Promise<void> => {
    if (!listName) {
      setError("List name is required");
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const listItems = await sp.web.lists.getByTitle(listName).items();
      setItems(listItems);
      console.log("listItems", listItems);
    } catch (error) {
      setError("Failed to fetch list items");
      console.error("Error fetching list items:", error);
    }
    setLoading(false);
  };

  const createItem = async (locationToAdd: IAddedLocation): Promise<void> => {
    console.log("Create item called with locationToAdd", locationToAdd);

    if (
      !locationToAdd ||
      !locationToAdd.displayName ||
      !locationToAdd.city ||
      !locationToAdd.state
    ) {
      console.error(
        "Invalid location data recieved to create item",
        locationToAdd
      );
      setError("Invalid location data provided.");
      throw new Error("Invalid location data.");
    }

    setError(null);

    try {
      await sp.web.lists.getByTitle(listName).items.add({
        Title: locationToAdd.displayName,
        State: locationToAdd.state,
        City: locationToAdd.city,
      });
      alert("Item created successfully!");
      await fetchListItems();
    } catch (error) {
      setError("Failed to create item. Please try again.");
      console.error("Create Item Error: ", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: number): Promise<void> => {
    try {
      await sp.web.lists.getByTitle(listName).items.getById(id).delete();
      alert("Item deleted successfully!");
    } catch (error) {
      setError("Failed to delete item. Please try again.");
      console.error("Delete Item Error: ", error);
    }
  };

  const handleDeleteItem = async (id: number): Promise<void> => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      setLoading(true);
      try {
        await deleteItem(id);
        await fetchListItems();
      } catch (error) {
        console.error("Error handling delete:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchListItems().catch((error) => {
      setError("Error fetching list items");
    });
  }, [listName]);

  useEffect(() => {
    if (locationToAdd) {
      console.log("Location to add DETECTED", locationToAdd);
      setLoading(true);
      setError(null);

      createItem(locationToAdd)
        .then(async () => {
          console.log("createItem promise resolved successfully.");

          onCityAddedSuccessfully();

          onAddedLocation();

          await fetchListItems(); // Await the fetch after success
        })
        .catch((err) => {
          console.error("useEffect createItem Error caught: ", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [locationToAdd]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Available Locations</h1>

      {items.length === 0 ? (
        <p>No locations found. Add a location from the map.</p>
      ) : (
        <ul className={styles.locationsList}>
          {items.map((item) => (
            <li key={item.Id} className={styles.locationItem}>
              <div className={styles.locationDetails}>
                <span>
                  <strong>{item.Title}</strong>
                </span>
                <span>
                  {item.City}, {item.State}
                </span>
              </div>
              <button
                className={styles.deleteButton}
                onClick={() => handleDeleteItem(item.Id)}
                aria-label={`Delete ${item.Title}`}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SPFxList;
