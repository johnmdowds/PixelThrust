using UnityEngine;
using UnityEditor;

[CustomEditor(typeof(BlockBrush))]
public class BlockBrushEditor : Editor
{
    void OnSceneGUI()
    {
        Event e = Event.current;
        var brush = (BlockBrush)target;

        // Only handle left click and ignore ALT (for camera movement)
        if ((e.type == EventType.MouseDown || e.type == EventType.MouseDrag) && e.button == 0 && !e.alt)
        {
            if (brush == null)
            {
                Debug.LogWarning("BlockBrushEditor: brush target is null.");
                return;
            }

            if (brush.blockPrefab == null)
            {
                Debug.LogWarning("BlockBrushEditor: No blockPrefab assigned.");
                return;
            }

            Ray ray = HandleUtility.GUIPointToWorldRay(e.mousePosition);
            Vector3 worldPos = ray.origin;
            Vector3Int gridPos = Vector3Int.RoundToInt(worldPos);

            // Log click for debugging
            Debug.Log($"🧱 Painting block at: {gridPos}");

            // Find or create the container
            GameObject parent = GameObject.Find("BlockContainer");
            if (parent == null)
            {
                parent = new GameObject("BlockContainer");
                Undo.RegisterCreatedObjectUndo(parent, "Create BlockContainer");
            }

            // Instantiate and parent the new block
            GameObject newBlock = (GameObject)PrefabUtility.InstantiatePrefab(brush.blockPrefab);
            if (newBlock != null)
            {
                newBlock.transform.position = gridPos;
                newBlock.transform.SetParent(parent.transform);
                Undo.RegisterCreatedObjectUndo(newBlock, "Paint Block");
            }
            else
            {
                Debug.LogError("BlockBrushEditor: Failed to instantiate block prefab.");
            }

            // Consume the click event
            e.Use();
        }
    }
}
