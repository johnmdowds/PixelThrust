using UnityEngine;
using UnityEngine.SceneManagement;

public class MainMenuLoader : MonoBehaviour
{
    public void StartGame()
    {
        SceneManager.LoadScene("Level01");
    }
}
