using UnityEngine;

public class PlayerController : MonoBehaviour
{
    public float thrustForce = 5f;
    public float rotationSpeed = 200f;
    public Rigidbody2D rb;

    [Header("Fuel System")]
    public float maxFuel = 100f;
    public float currentFuel;
    public float fuelConsumptionRate = 10f; // per second

    [Header("Effects")]
    public ParticleSystem thrustEffect;
    public AudioSource thrustAudio;
    public float particleCooldown = 0.1f; // Minimum time between particle toggles
    private float lastParticleToggle;

    void Start()
    {
        currentFuel = maxFuel;
        if (thrustEffect)
        {
            var emission = thrustEffect.emission;
            emission.enabled = false;
        }
    }

    void Update()
    {
        // Rotate
        float rotation = -Input.GetAxis("Horizontal") * rotationSpeed * Time.deltaTime;
        transform.Rotate(0, 0, rotation);

        // Thrust
        if (Input.GetKey(KeyCode.Space) && currentFuel > 0)
        {
            rb.AddForce(transform.up * thrustForce);
            currentFuel -= fuelConsumptionRate * Time.deltaTime;

            // Play effects with cooldown
            if (thrustEffect && Time.time - lastParticleToggle >= particleCooldown)
            {
                var emission = thrustEffect.emission;
                emission.enabled = true;
                if (!thrustEffect.isPlaying)
                    thrustEffect.Play();
                lastParticleToggle = Time.time;
            }
            
            if (thrustAudio && !thrustAudio.isPlaying)
                thrustAudio.Play();
        }
        else
        {
            // Stop effects
            if (thrustEffect)
            {
                var emission = thrustEffect.emission;
                emission.enabled = false;
            }
            if (thrustAudio && thrustAudio.isPlaying)
                thrustAudio.Stop();
        }

        // Clamp fuel to not go negative
        currentFuel = Mathf.Max(0, currentFuel);
    }

    public void Refuel()
    {
        currentFuel = maxFuel;
        Debug.Log("⛽ Refueled!");
    }
}
