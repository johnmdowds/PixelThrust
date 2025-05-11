using UnityEngine;

public class BlockBrush : MonoBehaviour
{
    public GameObject blockPrefab;
    
    [Header("Brush Settings")]
    public int brushWidth = 1;
    public int brushHeight = 1;
    public bool isDragging = false;
    public bool eraseMode = false;
    
    private Vector2 lastPaintPosition;
    private float minDragDistance = 0.1f; // Minimum distance between paint points
    
    void Update()
    {
        if (Input.GetMouseButtonDown(0))
        {
            isDragging = true;
            PaintAtMousePosition();
        }
        else if (Input.GetMouseButtonUp(0))
        {
            isDragging = false;
        }
        
        if (isDragging)
        {
            Vector2 currentMousePos = GetMouseWorldPosition();
            if (Vector2.Distance(currentMousePos, lastPaintPosition) >= minDragDistance)
            {
                PaintAtMousePosition();
            }
        }
        
        // Toggle erase mode with E key
        if (Input.GetKeyDown(KeyCode.E))
        {
            eraseMode = !eraseMode;
            Debug.Log("Erase mode: " + eraseMode);
        }
    }
    
    void PaintAtMousePosition()
    {
        Vector2 mousePos = GetMouseWorldPosition();
        lastPaintPosition = mousePos;
        
        for (int x = 0; x < brushWidth; x++)
        {
            for (int y = 0; y < brushHeight; y++)
            {
                Vector2 offset = new Vector2(x, y);
                Vector2 worldPos = mousePos + offset;
                
                if (eraseMode)
                {
                    // Find and destroy any blocks at this position
                    Collider2D[] colliders = Physics2D.OverlapPointAll(worldPos);
                    foreach (Collider2D collider in colliders)
                    {
                        if (collider.gameObject.CompareTag("Destructible"))
                        {
                            Destroy(collider.gameObject);
                        }
                    }
                }
                else
                {
                    // Check if there's already a block here
                    if (!Physics2D.OverlapPoint(worldPos))
                    {
                        Instantiate(blockPrefab, worldPos, Quaternion.identity);
                    }
                }
            }
        }
    }
    
    Vector2 GetMouseWorldPosition()
    {
        Vector3 mousePos = Input.mousePosition;
        mousePos.z = -Camera.main.transform.position.z;
        return Camera.main.ScreenToWorldPoint(mousePos);
    }
}
