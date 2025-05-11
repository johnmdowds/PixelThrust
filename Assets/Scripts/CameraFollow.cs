using UnityEngine;

public class CameraFollow : MonoBehaviour
{
    public Transform target;      // The ship
    public float smoothSpeed = 0.05f;
    public Vector3 offset;        // Optional offset if needed
    
    [Header("Camera Bounds")]
    public Vector2 minCamPos = new Vector2(-25f, -15f);  // Default bounds for 50x30 level
    public Vector2 maxCamPos = new Vector2(25f, 15f);
    public bool useBounds = true;

    void LateUpdate()
    {
        if (target == null) return;

        Vector3 desiredPosition = target.position + offset;
        Vector3 smoothedPosition = Vector3.Lerp(transform.position, desiredPosition, smoothSpeed);
        
        if (useBounds)
        {
            smoothedPosition.x = Mathf.Clamp(smoothedPosition.x, minCamPos.x, maxCamPos.x);
            smoothedPosition.y = Mathf.Clamp(smoothedPosition.y, minCamPos.y, maxCamPos.y);
        }
        
        transform.position = new Vector3(smoothedPosition.x, smoothedPosition.y, transform.position.z);
    }
}
