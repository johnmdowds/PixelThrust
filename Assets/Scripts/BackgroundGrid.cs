using UnityEngine;

public class BackgroundGrid : MonoBehaviour
{
    [Header("Grid Settings")]
    public float gridSize = 10f;        // Size of each grid cell
    public float lineWidth = 0.05f;     // Width of grid lines
    public Color gridColor = new Color(1f, 1f, 1f, 0.1f);
    public Color majorLineColor = new Color(1f, 1f, 1f, 0.2f);
    public int majorLineInterval = 5;   // Every Nth line is a major line

    [Header("Landmarks")]
    public bool showLandmarks = true;
    public float landmarkInterval = 50f;
    public Color landmarkColor = new Color(1f, 0.5f, 0f, 0.3f);
    public float landmarkSize = 1f;

    private void OnDrawGizmos()
    {
        if (!Application.isPlaying)
        {
            DrawGrid();
            if (showLandmarks)
                DrawLandmarks();
        }
    }

    private void DrawGrid()
    {
        // Get the camera's view bounds
        Camera cam = Camera.main;
        if (cam == null) return;

        float height = 2f * cam.orthographicSize;
        float width = height * cam.aspect;

        Vector3 camPos = cam.transform.position;
        float startX = Mathf.Floor((camPos.x - width/2) / gridSize) * gridSize;
        float startY = Mathf.Floor((camPos.y - height/2) / gridSize) * gridSize;
        float endX = Mathf.Ceil((camPos.x + width/2) / gridSize) * gridSize;
        float endY = Mathf.Ceil((camPos.y + height/2) / gridSize) * gridSize;

        // Draw vertical lines
        for (float x = startX; x <= endX; x += gridSize)
        {
            bool isMajorLine = Mathf.Abs(x % (gridSize * majorLineInterval)) < 0.01f;
            Gizmos.color = isMajorLine ? majorLineColor : gridColor;
            Gizmos.DrawLine(new Vector3(x, startY, 0), new Vector3(x, endY, 0));
        }

        // Draw horizontal lines
        for (float y = startY; y <= endY; y += gridSize)
        {
            bool isMajorLine = Mathf.Abs(y % (gridSize * majorLineInterval)) < 0.01f;
            Gizmos.color = isMajorLine ? majorLineColor : gridColor;
            Gizmos.DrawLine(new Vector3(startX, y, 0), new Vector3(endX, y, 0));
        }
    }

    private void DrawLandmarks()
    {
        Camera cam = Camera.main;
        if (cam == null) return;

        float height = 2f * cam.orthographicSize;
        float width = height * cam.aspect;

        Vector3 camPos = cam.transform.position;
        float startX = Mathf.Floor((camPos.x - width/2) / landmarkInterval) * landmarkInterval;
        float startY = Mathf.Floor((camPos.y - height/2) / landmarkInterval) * landmarkInterval;
        float endX = Mathf.Ceil((camPos.x + width/2) / landmarkInterval) * landmarkInterval;
        float endY = Mathf.Ceil((camPos.y + height/2) / landmarkInterval) * landmarkInterval;

        Gizmos.color = landmarkColor;

        for (float x = startX; x <= endX; x += landmarkInterval)
        {
            for (float y = startY; y <= endY; y += landmarkInterval)
            {
                Vector3 pos = new Vector3(x, y, 0);
                Gizmos.DrawWireSphere(pos, landmarkSize);
            }
        }
    }
} 