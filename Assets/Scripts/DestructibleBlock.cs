using UnityEngine;

public class DestructibleBlock : MonoBehaviour
{
    public int maxHealth = 1;
    private int currentHealth;

    private SpriteRenderer sr;

    void Start()
    {
        currentHealth = maxHealth;
        sr = GetComponent<SpriteRenderer>();
    }

    public void TakeDamage(int damage)
    {
        currentHealth -= damage;
        if (currentHealth <= 0)
        {
            Destroy(gameObject);
        }
        else
        {
            // Optional: flash or change color
            StartCoroutine(FlashRed());
        }
    }

    private System.Collections.IEnumerator FlashRed()
    {
        sr.color = Color.red;
        yield return new WaitForSeconds(0.1f);
        sr.color = Color.white;
    }
}
