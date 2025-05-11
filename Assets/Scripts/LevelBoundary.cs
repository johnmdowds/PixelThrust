using UnityEngine;

public class LevelBoundary : MonoBehaviour
{
    [Header("Boundary Settings")]
    public float width = 50f;  // Total width of the level
    public float height = 30f; // Total height of the level
    public float wallThickness = 1f;
    public Color gizmoColor = new Color(1f, 0f, 0f, 0.3f);

    private void Start()
    {
        CreateBoundaries();
    }

    private void CreateBoundaries()
    {
        // Create walls
        CreateWall("LeftWall", new Vector2(-width/2 - wallThickness/2, 0), new Vector2(wallThickness, height + wallThickness));
        CreateWall("RightWall", new Vector2(width/2 + wallThickness/2, 0), new Vector2(wallThickness, height + wallThickness));
        CreateWall("TopWall", new Vector2(0, height/2 + wallThickness/2), new Vector2(width + wallThickness, wallThickness));
        CreateWall("BottomWall", new Vector2(0, -height/2 - wallThickness/2), new Vector2(width + wallThickness, wallThickness));
    }

    private void CreateWall(string name, Vector2 position, Vector2 size)
    {
        GameObject wall = new GameObject(name);
        wall.transform.parent = transform;
        wall.transform.position = position;

        BoxCollider2D collider = wall.AddComponent<BoxCollider2D>();
        collider.size = size;
    }

    private void OnDrawGizmos()
    {
        // Draw the level boundaries in the editor
        Gizmos.color = gizmoColor;
        Gizmos.DrawWireCube(transform.position, new Vector3(width, height, 0));
    }
} 