using UnityEngine;
using UnityEngine.SceneManagement;

public class LandingDetector : MonoBehaviour
{
    public float maxLandingSpeed = 5f;

    void OnCollisionEnter2D(Collision2D collision)
    {
        if (collision.gameObject.CompareTag("LandingPad"))
        {
            float landingSpeed = collision.relativeVelocity.magnitude;

            if (landingSpeed <= maxLandingSpeed)
            {
                Debug.Log("🟢 Landed safely!");
                FindObjectOfType<PlayerController>().Refuel();
            }
            else
            {
                Debug.Log("💥 Crash landing!");
                ReloadScene();
            }
        }
        else
        {
            Debug.Log("💥 Hit something hard!");
            ReloadScene();
        }
    }

    void ReloadScene()
    {
        SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
    }
} 