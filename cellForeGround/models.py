from django.db import models


# Create your models here.

class CellObj(models.Model):
    dirname = models.CharField(max_length=50)
    model_cho = models.IntegerField(default=20)
    gp_cho = models.CharField(max_length=20)
    autosave = models.BooleanField(default=False)
    c_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.dirname + "@" + str(self.c_time)

    class Meta:
        ordering = ['-c_time']
